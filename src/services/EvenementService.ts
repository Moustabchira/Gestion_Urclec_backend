import prismaClient from "../utils/prismaClient";
import { Evenement } from "../types/index";
import { createEvenementSchema, updateEvenementSchema } from "../validations/evenementScheme";

interface GetAllEvenementFilters {
  titre?: string;
  description?: string;
  userId?: number;
  archive?: boolean;
}

export default class EvenementService {

  public async getEvenements(
    page = 1,
    limit = 10,
    filters?: GetAllEvenementFilters
  ): Promise<{ data: Evenement[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters) {
      if (filters.titre) where.titre = { contains: filters.titre, mode: "insensitive" };
      if (filters.description) where.description = { contains: filters.description, mode: "insensitive" };
      if (filters.userId) where.userId = filters.userId;
      if (filters.archive !== undefined) where.archive = filters.archive;
    }

    const [data, total] = await Promise.all([
      prismaClient.evenement.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
      prismaClient.evenement.count({ where }),
    ]);

    return { data, total };
  }

  public async getEvenementById(id: number): Promise<Evenement | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID d'événement invalide");

    return prismaClient.evenement.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  public async createEvenement(data: any): Promise<Evenement> {
    const validated = createEvenementSchema.parse(data);
    return prismaClient.evenement.create({
      data: validated,
      include: { user: true },
    });
  }

  public async updateEvenement(id: number, data: any): Promise<Evenement> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID d'événement invalide");

    const validated = updateEvenementSchema.parse(data);

    const dataToUpdate: any = { ...validated };

    if (validated.archive !== undefined) {
    dataToUpdate.archivedAt = validated.archive ? new Date() : null;
    }

    return prismaClient.evenement.update({
    where: { id },
    data: dataToUpdate,
    include: { user: true },
    });

  }

  public async deleteEvenement(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID d'événement invalide");

    await prismaClient.evenement.delete({ where: { id } });
  }
}
