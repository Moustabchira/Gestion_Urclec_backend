import prismaClient from "../utils/prismaClient";
import { createAgenceSchema, updateAgenceSchema } from "../validations/AgenceSchema";
import { generateCodeAgence } from "../utils/codeAgence";

export interface UpdateAgenceData {
  nom_agence?: string;
  ville?: string;
}

export default class AgenceService {

  // ========================= GET ALL =========================
  public async getAllAgences(
  page = 1,
  limit = 10,
  filters?: { nom_agence?: string; code_agence?: string; ville?: string }
): Promise<{ data: any[]; total: number }> {

  const skip = (page - 1) * limit;

  const where: any = {
    archive: false,
  };

  if (filters) {

    if (filters.nom_agence && filters.nom_agence.trim() !== "") {
      where.nom_agence = {
        contains: filters.nom_agence.trim()
      };
    }

    if (filters.code_agence && filters.code_agence.trim() !== "") {
      where.code_agence = {
        contains: filters.code_agence.trim()
      };
    }

    if (filters.ville && filters.ville.trim() !== "") {
      where.ville = {
        contains: filters.ville.trim()
      };
    }
  }

  console.log("Filtres reçus :", filters);
  const [data, total] = await Promise.all([
    prismaClient.agence.findMany({
      skip,
      take: limit,
      where,
      orderBy: { id: "desc" }
    }),
    prismaClient.agence.count({ where }),
  ]);

  return { data, total };
}

  // ========================= GET BY ID =========================
  public async getAgenceById(id: number) {

    if (!Number.isInteger(id) || id <= 0) {
      throw {
        type: "validation",
        errors: { id: "ID Agence invalide" },
      };
    }

    const agence = await prismaClient.agence.findUnique({ where: { id } });

    if (!agence) {
      throw {
        type: "validation",
        errors: { id: "Agence non trouvée" },
      };
    }

    return agence;
  }

  // ========================= CREATE =========================
  public async createAgence(data: any) {

    const validation = createAgenceSchema.safeParse(data);

    if (!validation.success) {
      const errors: Record<string, string> = {};

      validation.error.issues.forEach((err) => {
        const field = err.path[0] as string;

        if (field) {
          errors[field] = err.message;
        }
      });

      throw {
        type: "validation",
        errors,
      };
    }
    const code_agence = await generateCodeAgence();

    return prismaClient.agence.create({
      data: { ...validation.data, code_agence },
    });
  }

  // ========================= UPDATE =========================
  public async updateAgence(id: number, data: UpdateAgenceData) {

    if (!Number.isInteger(id) || id <= 0) {
      throw {
        type: "validation",
        errors: { id: "ID Agence invalide" },
      };
    }

    const validation = updateAgenceSchema.safeParse(data);

    if (!validation.success) {
      const errors: Record<string, string> = {};

      validation.error.issues.forEach((err) => {
        const field = err.path[0] as string;

        if (field) {
          errors[field] = err.message;
        }
      });

      throw {
        type: "validation",
        errors,
      };
    }

    return prismaClient.agence.update({
      where: { id },
      data: validation.data,
    });
  }

  // ========================= DELETE (ARCHIVE) =========================
  public async deleteAgence(id: number) {

    if (!Number.isInteger(id) || id <= 0) {
      throw {
        type: "validation",
        errors: { id: "ID Agence invalide" },
      };
    }

    const agence = await prismaClient.agence.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!agence) {
      throw {
        type: "validation",
        errors: { id: "Agence non trouvée" },
      };
    }

    if (agence.users.length > 0) {
      await prismaClient.user.updateMany({
        where: { agenceId: id },
        data: { archive: true, archivedAt: new Date() },
      });
    }

    return prismaClient.agence.update({
      where: { id },
      data: { archive: true, archivedAt: new Date() },
    });
  }

  // ========================= GET VILLES =========================
  public async getAllVilles(): Promise<string[]> {

    const villes = await prismaClient.agence.findMany({
      where: { archive: false },
      select: { ville: true },
      distinct: ["ville"],
      orderBy: { ville: "asc" },
    });

    return villes.map((v) => v.ville);
  }
}