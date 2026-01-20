// services/PointService.ts
import prismaClient from "../utils/prismaClient";
import { createPointServiceSchema, updatePointServiceSchema } from "../validations/PointServiceSchema";

export interface UpdatePointServiceData {
  nom?: string;
  agenceId?: number;
}

export default class PointService {

  // 🔹 Récupérer tous les points de service
  public async getAllPoints(filters?: { nom?: string; agenceId?: number }) {
    const where: any = {};

    if (filters?.nom) {
      where.nom = { contains: filters.nom, mode: "insensitive" };
    }

    if (filters?.agenceId) {
      where.agenceId = filters.agenceId;
    }

    return prismaClient.pointDeService.findMany({
      where,
      include: {
        agence: true,
        mouvementsSource: true,
        mouvementsDest: true,
      },
    });
  }

  // 🔹 Récupérer un point de service par ID
  public async getPointById(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Point de service invalide");

    return prismaClient.pointDeService.findUnique({
      where: { id },
      include: {
        agence: true,
        mouvementsSource: true,
        mouvementsDest: true,
      },
    });
  }

  // 🔹 Créer un point de service
  // services/PointService.ts
    public async createPoint(data: any) {
        const validated = createPointServiceSchema.parse(data);

        return prismaClient.pointDeService.create({
            data: validated, // contient nom + agenceId
        });
    }


  // 🔹 Mettre à jour un point de service
  public async updatePoint(id: number, data: UpdatePointServiceData) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Point de service invalide");

    const validated = updatePointServiceSchema.parse(data);

    return prismaClient.pointDeService.update({
      where: { id },
      data: validated,
    });
  }

  // 🔹 Supprimer un point de service (DELETE définitif)
  public async deletePoint(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Point de service invalide");

    return prismaClient.pointDeService.delete({
      where: { id },
    });
  }
}
