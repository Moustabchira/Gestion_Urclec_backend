import prismaClient from "../utils/prismaClient";
import { createPosteSchema, updatePosteSchema } from "../validations/posteSchema";

export interface UpdatePosteData {
  nom?: string;
}

export default class PosteService {

  // 🔹 Récupérer tous les postes avec pagination et filtres
  public async getAllPostes(page = 1, limit = 10, filters?: { nom?: string }): Promise<{ data: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = { archive: false };

    if (filters?.nom) {
      where.nom = { contains: filters.nom, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      prismaClient.poste.findMany({ skip, take: limit, where }),
      prismaClient.poste.count({ where }),
    ]);

    return { data, total };
  }

  // 🔹 Récupérer un poste par ID
  public async getPosteById(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Poste invalide");
    return prismaClient.poste.findUnique({ where: { id } });
  }

  // 🔹 Créer un poste
  public async createPoste(data: any) {
    const validated = createPosteSchema.parse(data);
    return prismaClient.poste.create({ data: validated });
  }

  // 🔹 Mettre à jour un poste
  public async updatePoste(id: number, data: UpdatePosteData) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Poste invalide");
    const validated = updatePosteSchema.parse(data);
    return prismaClient.poste.update({ where: { id }, data: validated });
  }

  // 🔹 Supprimer un poste (soft-delete)
  public async deletePoste(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Poste invalide");
    return prismaClient.poste.update({
      where: { id },
      data: { archive: true, archivedAt: new Date() },
    });
  }
}
