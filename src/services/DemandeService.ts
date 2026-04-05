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

  // ===================== GET ALL =====================
  public async getAllDemandes(page = 1, limit = 10, filters?: FilterDemande) {
    page = Math.max(Number(page), 1);
    limit = Math.max(Number(limit), 1);
    const skip = (page - 1) * limit;

    const where: any = { archive: false };
    if (filters?.type) where.type = filters.type;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.demande.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
        include: {
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

  // ===================== GET ONE =====================
  public async getDemandeById(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID invalide");

    return prisma.demande.findUnique({
      where: { id },
      include: {
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
    });
  }

  // ===================== CREATE =====================
  public async createDemande(data: any): Promise<Demande> {
    const validated = createDemandeSchema.parse(data);

    const employe = await prisma.user.findUnique({
      where: { id: validated.userId },
      include: { chef: true },
    });

    if (!employe) throw new Error("Employé non trouvé");
    if (!employe.chef) throw new Error("L'employé n'a pas de chef assigné");

    const demande = await prisma.demande.create({
      data: {
        type: validated.type,
        dateDebut: new Date(validated.dateDebut),
        dateFin: new Date(validated.dateFin),
        motif: validated.motif,
        userId: validated.userId,
        status: "EN_ATTENTE",
      },
    });

    const createDecision = async (userId: number, niveau: string) => {
      await prisma.decision.create({
        data: { demandeId: demande.id, userId, niveau, status: "EN_ATTENTE" },
      });
    };

    await createDecision(employe.chef.id, "CHEF");

    const drh = await prisma.user.findFirst({ where: { roles: { some: { role: { nom: "DRH" } } } } });
    if (drh) await createDecision(drh.id, "DRH");

    const dg = await prisma.user.findFirst({ where: { roles: { some: { role: { nom: "DG" } } } } });
    if (dg) await createDecision(dg.id, "DG");

    await notificationService.create({
      userId: employe.chef.id,
      titre: "Nouvelle demande à valider",
      message: `Demande de ${employe.nom} ${employe.prenom}`,
      type: "INFO",
    });

    return this.getDemandeById(demande.id) as Promise<Demande>;
  }

  // ===================== DECISION =====================
  public async prendreDecision(
    demandeId: number,
    userId: number,
    status: "APPROUVE" | "REFUSE"
  ): Promise<Demande> {

    const demande = await prisma.demande.findUnique({
      where: { id: demandeId },
      include: { user: { include: { chef: true, roles: { include: { role: true } } } }, decisions: true },
    });
    if (!demande) throw new Error("Demande introuvable");

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { roles: { include: { role: true } } } });
    if (!user) throw new Error("Utilisateur introuvable");
    if (user.id === demande.userId) throw new Error("Action interdite");

    let niveau: "CHEF" | "DRH" | "DG" | null = null;
    if (demande.user.chefId === user.id) niveau = "CHEF";
    else if (user.roles.some(r => r.role.nom === "DRH")) niveau = "DRH";
    else if (user.roles.some(r => r.role.nom === "DG")) niveau = "DG";

    if (!niveau) throw new Error("Non autorisé");

    const decision = demande.decisions.find(d => d.userId === user.id && d.niveau === niveau);
    if (!decision) throw new Error("Décision non trouvée");
    if (decision.status !== "EN_ATTENTE") throw new Error("Déjà traité");

    await prisma.decision.update({ where: { id: decision.id }, data: { status } });

    // REFUS
    if (status === "REFUSE") {
      await prisma.demande.update({ where: { id: demandeId }, data: { status: "REFUSE" } });
      await notificationService.create({ userId: demande.userId, titre: "Demande refusée", message: `Refusée par ${niveau}`, type: "ERROR" });
      return this.getDemandeById(demandeId) as Promise<Demande>;
    }

    // WORKFLOW
    let nextNiveau: "DRH" | "DG" | null = niveau === "CHEF" ? "DRH" : niveau === "DRH" ? "DG" : null;

    if (nextNiveau) {
      const nextDecision = demande.decisions.find(d => d.niveau === nextNiveau);
      if (nextDecision) await notificationService.create({ userId: nextDecision.userId, titre: "Nouvelle demande à valider", message: `Demande validée par ${niveau}`, type: "INFO" });
    }

    if (!nextNiveau && niveau === "DG") {
      await prisma.demande.update({ where: { id: demandeId }, data: { status: "APPROUVE" } });
      await notificationService.create({ userId: demande.userId, titre: "Demande approuvée", message: "Votre demande a été validée définitivement", type: "SUCCESS" });
    }

    return this.getDemandeById(demandeId) as Promise<Demande>;
  }

  // ===================== UPDATE =====================
  public async updateDemande(id: number, data: any) {
    const validated = updateDemandeSchema.parse(data);
    return prisma.demande.update({
      where: { id },
      data: {
        ...(validated.type && { type: validated.type }),
        ...(validated.dateDebut && { dateDebut: new Date(validated.dateDebut) }),
        ...(validated.dateFin && { dateFin: new Date(validated.dateFin) }),
        ...(validated.motif && { motif: validated.motif }),
        ...(validated.status && { status: validated.status }),
      },
      include: { decisions: true, user: { include: { chef: true } } },
    });
  }

  // ===================== DELETE =====================
  public async deleteDemande(id: number) {
    const exist = await prisma.demande.findUnique({ where: { id } });
    if (!exist) throw new Error("Demande introuvable");
    await prisma.decision.deleteMany({ where: { demandeId: id } });
    await prisma.demande.delete({ where: { id } });
  }
}