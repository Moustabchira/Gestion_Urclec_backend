import prisma from "../utils/prismaClient";
import { Demande } from "../types";
import { createDemandeSchema, updateDemandeSchema } from "../validations/demandeSchema";

export interface FilterDemande {
  type?: string;
  userId?: number;
  status?: string;
}

export default class DemandeService {

  // ===================== Récupérer toutes les demandes =====================
  public async getAllDemandes(
  page = 1,
  limit = 10,
  filters?: FilterDemande
): Promise<{ data: Demande[]; total: number; totalPages: number }> {

  page = Number(page) > 0 ? Number(page) : 1;
  limit = Number(limit) > 0 ? Number(limit) : 10;

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
      orderBy: { createdAt: "desc" }, // important pour pagination stable
      include: {
        conge: true,
        absence: true,
        demandePermission: true,
        decisions: { include: { user: true } },
        user: {
          include: {
            chef: true,
            roles: { include: { role: true } },
            poste: true,
            agence: true,
          },
        },
      },
    }),
    prisma.demande.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { data, total, totalPages };
}
  // ===================== Récupérer une demande par ID =====================
  public async getDemandeById(id: number): Promise<Demande | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID invalide");
    return prisma.demande.findUnique({
      where: { id },
      include: { 
        conge: true, 
        absence: true, 
        demandePermission: true, 
        decisions: { include: { user: true } },
        user: { include: { chef: true, roles: { include: { role: true } }, poste: true, agence: true } } 
      },
    });
  }

  // ===================== Création d'une demande =====================
  public async createDemande(data: any): Promise<Demande> {
  const validated = createDemandeSchema.parse(data);

  // Récupérer l’employé et son chef
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

  // ===================== Décisions =====================
  // CHEF
  await prisma.decision.create({
    data: {
      demandeId: demande.id,
      userId: employe.chef.id,
      niveau: "CHEF",
      status: "EN_ATTENTE",
    },
  });

  // DRH - prendre juste le premier trouvé
  const drh = await prisma.user.findFirst({
    where: { roles: { some: { role: { nom: "DRH" } } } }
  });
  if (drh) {
    await prisma.decision.create({
      data: {
        demandeId: demande.id,
        userId: drh.id,
        niveau: "DRH",
        status: "EN_ATTENTE",
      }
    });
  }

  // DG - pareil, prendre juste le premier trouvé
  const dg = await prisma.user.findFirst({
    where: { roles: { some: { role: { nom: "DG" } } } }
  });
  if (dg) {
    await prisma.decision.create({
      data: {
        demandeId: demande.id,
        userId: dg.id,
        niveau: "DG",
        status: "EN_ATTENTE",
      }
    });
  }

  // Retourner la demande avec toutes les relations
  return prisma.demande.findUnique({
    where: { id: demande.id },
    include: {
      conge: true,
      absence: true,
      demandePermission: true,
      decisions: { include: { user: true } },
      user: { include: { chef: true } },
    },
  }) as Promise<Demande>;
}


  // ===================== Prendre une décision =====================
public async prendreDecision(
  demandeId: number,
  userId: number,
  status: "APPROUVE" | "REFUSE"
): Promise<Demande> {
  console.log("Début prise de décision");

  // Charger la demande avec décisions et utilisateur
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: {
      user: { include: { chef: true, roles: { include: { role: true } } } },
      decisions: { include: { user: true } }
    },
  });
  if (!demande) throw new Error("Demande introuvable");
  console.log("🔹 Demande chargée :", demande.id);

  // Charger l’utilisateur
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } }
  });
  if (!user) throw new Error("Utilisateur introuvable");
  console.log("🔹 Utilisateur :", user.nom, "-", user.roles.map(r => r.role.nom));

  if (user.id === demande.userId) throw new Error("On ne peut pas valider sa propre demande");

  // Déterminer le niveau
  let niveau: "CHEF" | "DRH" | "DG" | null = null;

  if (demande.user.chefId === user.id && demande.decisions.some(d => d.niveau === "CHEF" && d.userId === user.id && d.status === "EN_ATTENTE")) {
    niveau = "CHEF";
  } else if (user.roles.some(r => r.role.nom === "DRH") && demande.decisions.some(d => d.niveau === "DRH" && d.userId === user.id && d.status === "EN_ATTENTE")) {
    niveau = "DRH";
  } else if (user.roles.some(r => r.role.nom === "DG") && demande.decisions.some(d => d.niveau === "DG" && d.userId === user.id && d.status === "EN_ATTENTE")) {
    niveau = "DG";
  } else {
    throw new Error("Vous n'êtes pas autorisé ou vous avez déjà pris votre décision pour ce niveau");
  }

  // Chercher la décision existante pour ce niveau et cet utilisateur
  const existing = demande.decisions.find(d => d.userId === user.id && d.niveau === niveau);
  if (!existing) throw new Error(`Aucune décision ne vous est assignée pour le niveau ${niveau}`);
  if (existing.status !== "EN_ATTENTE") throw new Error(`Vous avez déjà pris votre décision pour le niveau ${niveau}`);

  console.log("➡ Niveau de décision :", niveau);
  console.log("🔹 Décision existante :", existing);

  // Vérifier l’ordre hiérarchique
  const chef = demande.decisions.find(d => d.niveau === "CHEF");
  const drhs = demande.decisions.filter(d => d.niveau === "DRH");

  if (niveau === "DRH" && chef?.status !== "APPROUVE")
    throw new Error("Le DRH doit attendre la décision du CHEF");

  if (niveau === "DG" && drhs.some(d => d.status !== "APPROUVE"))
    throw new Error("Le DG doit attendre la décision du DRH");

  // Mettre à jour la décision
  await prisma.decision.update({
    where: { id: existing.id },
    data: { status }
  });
  console.log(`✅ Décision ${status} prise pour ${niveau}`);

  // Mise à jour du statut de la demande
  if (status === "REFUSE") {
    await prisma.demande.update({ where: { id: demandeId }, data: { status: "REFUSE" } });
  } else if (status === "APPROUVE") {
    // Si tout DG a approuvé, alors demande approuvée
    const updatedDemande = await prisma.demande.findUnique({
      where: { id: demandeId },
      include: { decisions: true }
    });
    const dgDecisions = updatedDemande?.decisions.filter(d => d.niveau === "DG");
    if (dgDecisions && dgDecisions.every(d => d.status === "APPROUVE")) {
      await prisma.demande.update({ where: { id: demandeId }, data: { status: "APPROUVE" } });
      console.log("🎉 Tous les DG ont approuvé, demande approuvée");
    }
  }

  // Retourner la demande mise à jour
  return prisma.demande.findUnique({
    where: { id: demandeId },
    include: { decisions: { include: { user: true } }, user: true }
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
      include: { conge: true, absence: true, demandePermission: true, decisions: true, user: { include: { chef: true } } },
    });
  }

  // ===================== Suppression d'une demande =====================
  public async deleteDemande(id: number): Promise<void> {
    const demande = await prisma.demande.findUnique({
      where: { id },
      include: { conge: true, absence: true, demandePermission: true, decisions: true },
    });
    if (!demande) throw new Error("Demande non trouvée");

    await prisma.decision.deleteMany({ where: { demandeId: id } });
    if (demande.conge) await prisma.conge.delete({ where: { id: demande.conge.id } });
    if (demande.absence) await prisma.absence.delete({ where: { id: demande.absence.id } });
    if (demande.demandePermission) await prisma.demandePermission.delete({ where: { id: demande.demandePermission.id } });
    await prisma.demande.delete({ where: { id } });
  }
}
