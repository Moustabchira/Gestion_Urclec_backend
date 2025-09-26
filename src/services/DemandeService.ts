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
            include: { conge: true, absence: true, demandePermission: true, decisions: true },
          }),
          prisma.demande.count({ where }),
        ]);

        return { data, total };
      }

      public async getDemandeById(id: number): Promise<Demande | null> {
        if (!Number.isInteger(id) || id <= 0) throw new Error("ID invalide");
        return prisma.demande.findUnique({
          where: { id },
          include: { conge: true, absence: true, demandePermission: true, decisions: true },
        });
      }

    public async createDemande(data: any): Promise<Demande> {
      const validated = createDemandeSchema.parse(data);

      return prisma.demande.create({
        data: {
          type: validated.type,
          dateDebut: new Date(validated.dateDebut),
          dateFin: new Date(validated.dateFin),
          motif: validated.motif,
          userId: validated.userId,
          status: validated.status ?? "EN_ATTENTE",
          ...(validated.type === "conge" && validated.nbJours !== undefined && { conge: { create: { nbJours: validated.nbJours } } }),
          ...(validated.type === "absence" && validated.justification && { absence: { create: { justification: validated.justification } } }),
          ...(validated.type === "permission" && validated.duree && { demandePermission: { create: { duree: validated.duree } } }),
        },
        include: { conge: true, absence: true, demandePermission: true, decisions: true },
      });
    }

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
          include: { conge: true, absence: true, demandePermission: true, decisions: true },
        });
      }

    public async deleteDemande(id: number): Promise<void> {
      if (!Number.isInteger(id) || id <= 0) throw new Error("ID invalide");
      await prisma.demande.delete({ where: { id } });
    }
}
