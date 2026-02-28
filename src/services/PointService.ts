// services/PointService.ts
import prismaClient from "../utils/prismaClient";
import { createPointServiceSchema, updatePointServiceSchema } from "../validations/PointServiceSchema";

export interface UpdatePointServiceData {
  nom?: string;
  agenceId?: number;
}

export default class PointService {

  // 🔹 Récupérer tous les points de service
  public async getAllPoints(params: {
  nom?: string;
  agenceId?: number;
  page: number;
  limit: number;
}) {
  const { nom, agenceId, page, limit } = params;

  const where: any = {};

  if (nom) {
    where.nom = { contains: nom, mode: "insensitive" };
  }

  if (agenceId) {
    where.agenceId = agenceId;
  }

  const total = await prismaClient.pointDeService.count({ where });

  const points = await prismaClient.pointDeService.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      agence: true,
      mouvementsSource: true,
      mouvementsDest: true,
    },
  });

  return {
    data: points,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
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
