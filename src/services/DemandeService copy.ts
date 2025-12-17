import prisma from "../utils/prismaClient";
import { Demande } from "../types";
import { createDemandeSchema, updateDemandeSchema } from "../validations/demandeSchema";

export interface FilterDemande {
  type?: string;
  userId?: number;
  status?: string;
}

export default class DemandeService {

  public async getAllDemandes(
    page = 1,
    limit = 10,
    filters?: FilterDemande
  ): Promise<{ data: Demande[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = { archive: false };
    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.userId) where.userId = filters.userId;
      if (filters.status) where.status = filters.status;
    }

    const [data, total] = await Promise.all([
      prisma.demande.findMany({
        skip,
        take: limit,
        where,
        include: { 
          conge: true, 
          absence: true, 
          demandePermission: true, 
          decisions: true, 
          user: { 
            include: { 
              chef: true, 
              roles: { include: { role: true } }, 
              poste: true, 
              agence: true
            } 
        },
      }}),
      prisma.demande.count({ where }),
    ]);

    return { data, total };
  }

  public async getDemandeById(id: number): Promise<Demande | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID invalide");
    return prisma.demande.findUnique({
      where: { id },
      include: { 
        conge: true, 
        absence: true, 
        demandePermission: true, 
        decisions: true, 
        user: { 
          include: { 
            chef: true,
            roles: { include: { role: true } }, 
            poste: true, 
            agence: true
          } 
        } 
      },
    });
  }

  // ===================== Création d'une demande avec décisions hiérarchiques =====================
   public async createDemande(data: any): Promise<Demande> {
    const validated = createDemandeSchema.parse(data);

    // Récupérer l’employé et son chef (chef obligatoire)
    const employe = await prisma.user.findUnique({
      where: { id: validated.userId },
      include: { chef: true },
    });
    if (!employe) throw new Error("Employé non trouvé");
    if (!employe.chef) throw new Error("L'employé n'a pas de chef assigné");

    // Créer la demande
    const demande = await prisma.demande.create({
      data: {
        type: validated.type,
        dateDebut: new Date(validated.dateDebut),
        dateFin: new Date(validated.dateFin),
        motif: validated.motif,
        userId: validated.userId,
        status: "EN_ATTENTE",
        ...(validated.type === "conge" && validated.nbJours !== undefined && { conge: { create: { nbJours: validated.nbJours } } }),
        ...(validated.type === "absence" && validated.justification && { absence: { create: { justification: validated.justification } } }),
        ...(validated.type === "permission" && validated.duree && { demandePermission: { create: { duree: validated.duree } } }),
      },
    });

    // Récupérer DRH et DG
    let drh = await prisma.user.findFirst({ where: { poste: { nom: "DRH" } } });
    let dg  = await prisma.user.findFirst({ where: { poste: { nom: "DG" } } });

    // Si DRH ou DG n’existent pas, utiliser l’utilisateur qui crée la demande
    if (!drh) drh = employe;
    if (!dg) dg = employe;

    // Créer les décisions hiérarchiques
    await prisma.decision.createMany({
      data: [
        { demandeId: demande.id, userId: employe.chef.id, niveau: "CHEF", status: "EN_ATTENTE" },
        { demandeId: demande.id, userId: drh.id, niveau: "DRH", status: "EN_ATTENTE" },
        { demandeId: demande.id, userId: dg.id, niveau: "DG", status: "EN_ATTENTE" },
      ],
    });

    // Retourner la demande complète
    return prisma.demande.findUnique({
      where: { id: demande.id },
      include: { 
        conge: true, 
        absence: true, 
        demandePermission: true, 
        decisions: true, 
        user: { include: { chef: true } } 
      },
    }) as Promise<Demande>;
  }


  // ===================== Mise à jour d'une demande =====================
  public async updateDemande(id: number, data: any): Promise<Demande> {
    const validated = updateDemandeSchema.parse(data);

    const existing = await prisma.demande.findUnique({
      where: { id },
      include: { conge: true, absence: true, demandePermission: true },
    });
    if (!existing) throw new Error("Demande non trouvée");

    const relationUpdates: any = {};
    if (validated.type === "conge" && validated.nbJours !== undefined) {
      relationUpdates.conge = { upsert: { create: { nbJours: validated.nbJours }, update: { nbJours: validated.nbJours } } };
    }
    if (validated.type === "absence" && validated.justification) {
      relationUpdates.absence = { upsert: { create: { justification: validated.justification }, update: { justification: validated.justification } } };
    }
    if (validated.type === "permission" && validated.duree) {
      relationUpdates.demandePermission = { upsert: { create: { duree: validated.duree }, update: { duree: validated.duree } } };
    }

    return prisma.demande.update({
      where: { id },
      data: {
        type: validated.type,
        dateDebut: validated.dateDebut ? new Date(validated.dateDebut) : undefined,
        dateFin: validated.dateFin ? new Date(validated.dateFin) : undefined,
        motif: validated.motif,
        status: validated.status,
        ...relationUpdates,
      },
      include: { 
        conge: true, 
        absence: true, 
        demandePermission: true, 
        decisions: true, 
        user: { include: { chef: true } } 
      },
    });
  }

  // ===================== Suppression =====================
  public async deleteDemande(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID invalide");

    const demande = await prisma.demande.findUnique({
      where: { id },
      include: { conge: true, absence: true, demandePermission: true, decisions: true },
    });
    if (!demande) throw new Error("Demande non trouvée");

    // --- Supprimer décisions ---
    await prisma.decision.deleteMany({ where: { demandeId: id } });

    // --- Supprimer sous-modèles ---
    if (demande.conge) {
      await prisma.conge.delete({ where: { id: demande.conge.id } });
    }
    if (demande.absence) {
      await prisma.absence.delete({ where: { id: demande.absence.id } });
    }
    if (demande.demandePermission) {
      await prisma.demandePermission.delete({ where: { id: demande.demandePermission.id } });
    }

    // --- Supprimer la demande ---
    await prisma.demande.delete({ where: { id } });
  }



  // ===================== Prendre une décision =====================
    public async prendreDecision(
    demandeId: number,
    userId: number,
    status: "APPROUVE" | "REFUSE"
  ): Promise<Demande> {
    // 1️⃣ Récupérer la demande et les décisions existantes
    const demande = await prisma.demande.findUnique({
      where: { id: demandeId },
      include: {
        user: { include: { chef: true, poste: true } },
        decisions: true,
        conge: true,
        absence: true,
        demandePermission: true,
      },
    });

    if (!demande) throw new Error("Demande introuvable");

    // 2️⃣ Récupérer l'utilisateur qui prend la décision
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { poste: true } });
    if (!user) throw new Error("Utilisateur introuvable");

    // 3️⃣ Déterminer le niveau de l'utilisateur (CHEF, DRH, DG)
    let niveau = "";
    if (demande.user.chefId === user.id) {
      niveau = "CHEF";
    } else if (user.poste.nom.toUpperCase() === "DRH") {
      niveau = "DRH";
    } else if (user.poste.nom.toUpperCase() === "DG") {
      niveau = "DG";
    } else {
      throw new Error("Utilisateur non autorisé à prendre une décision pour cette demande");
    }

    // 4️⃣ Vérifier le tour selon le workflow
    const chefDecision = demande.decisions.find(d => d.niveau === "CHEF");
    const drhDecision = demande.decisions.find(d => d.niveau === "DRH");
    const dgDecision = demande.decisions.find(d => d.niveau === "DG");

    switch (niveau) {
      case "CHEF":
        if (chefDecision && chefDecision.status !== "EN_ATTENTE") 
          throw new Error("Le chef a déjà pris sa décision");
        break;
      case "DRH":
        if (!chefDecision || chefDecision.status === "EN_ATTENTE") 
          throw new Error("Le DRH ne peut décider avant le chef");
        if (drhDecision && drhDecision.status !== "EN_ATTENTE") 
          throw new Error("Le DRH a déjà pris sa décision");
        break;
      case "DG":
        if (!drhDecision || drhDecision.status === "EN_ATTENTE") 
          throw new Error("Le DG ne peut décider avant le DRH");
        if (dgDecision && dgDecision.status !== "EN_ATTENTE") 
          throw new Error("Le DG a déjà pris sa décision");
        break;
    }

    // 5️⃣ Mettre à jour la décision correspondante (ou créer si jamais)
    await prisma.decision.updateMany({
      where: { demandeId, niveau },
      data: { status, userId },
    });

    // 6️⃣ Mettre à jour le statut global si DG a décidé
  if (niveau === "DG") { 
    await prisma.demande.update({ 
      where: { id: demandeId }, 
      data: { status: status === "REFUSE" ? "REFUSE" : "APPROUVE" }, 
    }); 
  }

  // 7️⃣ Retourner la demande mise à jour
  const updatedDemande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: {
      decisions: { include: { user: true } },
      user: { include: { chef: true } },
      conge: true,
      absence: true,
      demandePermission: true,
    },
  });

  if (!updatedDemande) throw new Error("Erreur lors de la récupération de la demande mise à jour");

  return updatedDemande;
  }

}
