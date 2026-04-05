import prisma from "../utils/prismaClient";
import { Demande } from "../types";
import { createDemandeSchema, updateDemandeSchema } from "../validations/demandeSchema";
import NotificationService from "./NotificationService";

export interface FilterDemande {
  type?: string;
  userId?: number;
  status?: string;
}

const notificationService = new NotificationService();

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
        orderBy: { createdAt: "desc" },
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

    return { data, total, totalPages: Math.ceil(total / limit) };
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

    // 1️⃣ Récupérer l’employé et son chef
    const employe = await prisma.user.findUnique({
      where: { id: validated.userId },
      include: { chef: true },
    });
    if (!employe) throw new Error("Employé non trouvé");
    if (!employe.chef) throw new Error("L'employé n'a pas de chef assigné");

    // 2️⃣ Créer la demande
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

    // 3️⃣ Créer les décisions
    const chefDecision = await prisma.decision.create({
      data: {
        demandeId: demande.id,
        userId: employe.chef.id,
        niveau: "CHEF",
        status: "EN_ATTENTE",
      },
    });

    const drh = await prisma.user.findFirst({
      where: { roles: { some: { role: { nom: "DRH" } } } },
    });
    let drhDecision;
    if (drh) {
      drhDecision = await prisma.decision.create({
        data: { demandeId: demande.id, userId: drh.id, niveau: "DRH", status: "EN_ATTENTE" },
      });
    }

    const dg = await prisma.user.findFirst({
      where: { roles: { some: { role: { nom: "DG" } } } },
    });
    let dgDecision;
    if (dg) {
      dgDecision = await prisma.decision.create({
        data: { demandeId: demande.id, userId: dg.id, niveau: "DG", status: "EN_ATTENTE" },
      });
    }

    // 4️⃣ Notifications
    // 🔹 Notifier le CHEF dès la création
    await notificationService.create({
      userId: employe.chef.id,
      titre: "Nouvelle demande à valider",
      message: `Vous avez une nouvelle demande de ${employe.nom} ${employe.prenom} à valider.`,
      type: "INFO",
    });

    // 🔹 Notifier l'employé
    await notificationService.create({
      userId: employe.id,
      titre: "Demande créée",
      message: "Votre demande a été créée et est en attente de validation par votre CHEF.",
      type: "SUCCESS",
    });

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
  // 1️⃣ Récupérer la demande avec ses décisions et l'utilisateur
  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: {
      user: { include: { chef: true, roles: { include: { role: true } } } },
      decisions: { include: { user: true } },
    },
  });
  if (!demande) throw new Error("Demande introuvable");

  // 2️⃣ Récupérer l'utilisateur qui prend la décision
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  if (!user) throw new Error("Utilisateur introuvable");
  if (user.id === demande.userId) throw new Error("On ne peut pas valider sa propre demande");

  // 3️⃣ Déterminer le niveau de décision
  let niveau: "CHEF" | "DRH" | "DG" | null = null;
  if (
    demande.user.chefId === user.id &&
    demande.decisions.some(d => d.niveau === "CHEF" && d.userId === user.id && d.status === "EN_ATTENTE")
  ) niveau = "CHEF";
  else if (
    user.roles.some(r => r.role.nom === "DRH") &&
    demande.decisions.some(d => d.niveau === "DRH" && d.userId === user.id && d.status === "EN_ATTENTE")
  ) niveau = "DRH";
  else if (
    user.roles.some(r => r.role.nom === "DG") &&
    demande.decisions.some(d => d.niveau === "DG" && d.userId === user.id && d.status === "EN_ATTENTE")
  ) niveau = "DG";
  else throw new Error("Vous n'êtes pas autorisé ou vous avez déjà pris votre décision pour ce niveau");

  const existing = demande.decisions.find(d => d.userId === user.id && d.niveau === niveau);
  if (!existing) throw new Error(`Aucune décision ne vous est assignée pour le niveau ${niveau}`);
  if (existing.status !== "EN_ATTENTE") throw new Error(`Vous avez déjà pris votre décision pour le niveau ${niveau}`);

  // 4️⃣ Vérifier l’ordre hiérarchique
  const chef = demande.decisions.find(d => d.niveau === "CHEF");
  const drhs = demande.decisions.filter(d => d.niveau === "DRH");
  if (niveau === "DRH" && chef?.status !== "APPROUVE") throw new Error("Le DRH doit attendre la décision du CHEF");
  if (niveau === "DG" && drhs.some(d => d.status !== "APPROUVE")) throw new Error("Le DG doit attendre la décision du DRH");

  // 5️⃣ Mettre à jour la décision
  await prisma.decision.update({ where: { id: existing.id }, data: { status } });

  // 6️⃣ Récupérer DRH et DG pour notifications
  const drh = await prisma.user.findFirst({ where: { roles: { some: { role: { nom: "DRH" } } } } });
  const dg = await prisma.user.findFirst({ where: { roles: { some: { role: { nom: "DG" } } } } });

  // 7️⃣ Notifications
  if (niveau === "CHEF" && status === "APPROUVE" && drh) {
    await notificationService.create({
      userId: drh.id,
      titre: "Demande en attente de votre validation",
      message: `La demande de ${demande.user.nom} ${demande.user.prenom} a été approuvée par le CHEF.`,
      type: "INFO",
    });
  }
  if (niveau === "DRH" && status === "APPROUVE" && dg) {
    await notificationService.create({
      userId: dg.id,
      titre: "Demande en attente de votre validation",
      message: `La demande de ${demande.user.nom} ${demande.user.prenom} a été approuvée par le DRH.`,
      type: "INFO",
    });
  }
  if (status === "REFUSE") {
    await notificationService.create({
      userId: demande.userId,
      titre: "Demande refusée",
      message: `Votre demande a été refusée par le ${niveau}.`,
      type: "ERROR",
    });
    await prisma.demande.update({ where: { id: demandeId }, data: { status: "REFUSE" } });
  } else if (status === "APPROUVE") {
    // Si tous les DG ont approuvé, la demande est validée
    const updatedDemande = await prisma.demande.findUnique({
      where: { id: demandeId },
      include: { decisions: true },
    });
    const dgDecisions = updatedDemande?.decisions.filter(d => d.niveau === "DG");
    if (dgDecisions && dgDecisions.every(d => d.status === "APPROUVE")) {
      await prisma.demande.update({ where: { id: demandeId }, data: { status: "APPROUVE" } });
      await notificationService.create({
        userId: demande.userId,
        titre: "Demande approuvée",
        message: "Votre demande a été approuvée par tous les niveaux hiérarchiques.",
        type: "SUCCESS",
      });
    }
  }

  // 8️⃣ Retourner la demande mise à jour
  return prisma.demande.findUnique({
    where: { id: demandeId },
    include: { decisions: { include: { user: true } }, user: true },
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