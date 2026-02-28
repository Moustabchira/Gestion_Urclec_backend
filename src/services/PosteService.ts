import prismaClient from "../utils/prismaClient";
import { createPosteSchema, updatePosteSchema } from "../validations/posteSchema";

export interface UpdatePosteData {
  nom?: string;
}

export default class PosteService {

  // 🔹 Récupérer tous les postes actifs avec pagination et filtres
  public async getAllPostes(
    page = 1,
    limit = 10,
    filters?: { nom?: string }
  ): Promise<{ data: any[]; total: number }> {

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

  // 🔹 Créer un poste (avec restauration si archivé)
  public async createPoste(data: any) {
    const validated = createPosteSchema.parse(data);

    const existing = await prismaClient.poste.findUnique({ where: { nom: validated.nom } });

    if (existing && existing.archive) {
      return prismaClient.poste.update({
        where: { id: existing.id },
        data: { archive: false, archivedAt: null },
      });
    }

    if (existing && !existing.archive) throw new Error("Un poste avec ce nom existe déjà");

    return prismaClient.poste.create({ data: validated });
  }

  // 🔹 Mettre à jour un poste (sans conflit unique)
  public async updatePoste(id: number, data: UpdatePosteData) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID Poste invalide");

    const validated = updatePosteSchema.parse(data);

    if (validated.nom) {
      const existing = await prismaClient.poste.findUnique({ where: { nom: validated.nom } });

      if (existing && existing.id !== id && !existing.archive)
        throw new Error("Un autre poste actif porte déjà ce nom");

      if (existing && existing.id !== id && existing.archive)
        throw new Error("Ce nom correspond à un poste archivé. Veuillez le restaurer.");
    }

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