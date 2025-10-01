import prismaClient from "../utils/prismaClient";
import { createAgenceSchema, updateAgenceSchema } from "../validations/AgenceSchema";

export interface UpdateAgenceData {
  nom_agence?: string;
  code_agence?: string;
  ville?: string;
}

export default class AgenceService {

  public async getAllAgences(
    page = 1,
    limit = 10,
    filters?: { nom_agence?: string; code_agence?: string; ville?: string }
  ): Promise<{ data: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = { archive: false };
    if (filters) {
      if (filters.nom_agence) where.nom_agence = { contains: filters.nom_agence, mode: "insensitive" };
      if (filters.code_agence) where.code_agence = { contains: filters.code_agence, mode: "insensitive" };
      if (filters.ville) where.ville = { contains: filters.ville, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      prismaClient.agence.findMany({ skip, take: limit, where }),
      prismaClient.agence.count({ where }),
    ]);

    return { data, total };
  }

  public async getAgenceById(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Agence invalide");
    return prismaClient.agence.findUnique({ where: { id } });
  }

  public async createAgence(data: any) {
    const validated = createAgenceSchema.parse(data);
    return prismaClient.agence.create({ data: validated });
  }

  public async updateAgence(id: number, data: UpdateAgenceData) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Agence invalide");

    const validated = updateAgenceSchema.parse(data);
    return prismaClient.agence.update({ where: { id }, data: validated });
  }

  public async deleteAgence(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Agence invalide");

    return prismaClient.agence.update({ 
      where: { id }, 
      data: { archive: true, archivedAt: new Date() } 
    });
  }
}
