import prismaClient from "../utils/prismaClient";
import { createMouvementSchema, updateMouvementSchema } from "../validations/equipementSchema";

export default class MouvementService {

  // ----------------- Création d’un mouvement -----------------
  async createMouvement(data: any, prisma = prismaClient) {
  const validated = createMouvementSchema.parse(data);

  return prisma.mouvementEquipement.create({
    data: {
      type: validated.type,
      commentaire: validated.commentaire ?? null,
      dateConfirmation: validated.dateConfirmation ?? null,
      confirme: validated.confirme ?? false,
      equipementId: validated.equipementId,
      initiateurId: validated.initiateurId,
      confirmeParId: validated.confirmeParId ?? undefined,
      responsableDestinationId: validated.responsableDestinationId ?? undefined,
      agenceSourceId: validated.agenceSourceId ?? undefined,
      agenceDestinationId: validated.agenceDestinationId ?? undefined,
      pointServiceSourceId: validated.pointServiceSourceId ?? undefined,
      pointServiceDestinationId: validated.pointServiceDestinationId ?? undefined,
      etatAvant: validated.etatAvant ?? null,
      etatApres: validated.etatApres ?? null,
    },
    include: {
      equipement: true,
      initiateur: true,
      confirmePar: true,
      responsableDestination: { include: { agence: true } },
      agenceSource: true,
      agenceDestination: true,
      pointServiceSource: true,
      pointServiceDestination: true,
    },
  });
}

  // ----------------- Confirmation d’un mouvement -----------------
  async confirmerMouvement(id: number, confirmeParId: number, prisma = prismaClient) {
  if (!confirmeParId) throw new Error("confirmeParId manquant");

  return prisma.mouvementEquipement.update({
    where: { id },
    data: {
      confirme: true,
      confirmeParId,
      dateConfirmation: new Date(),
    },
    include: {
      equipement: true,
      initiateur: true,
      confirmePar: true,
      responsableDestination: { include: { agence: true } },
      agenceSource: true,
      agenceDestination: true,
      pointServiceSource: true,
      pointServiceDestination: true,
    },
  });
}


  // ----------------- Rejet d’un mouvement -----------------
  async rejeterMouvement(id: number, confirmeParId: number) {
    if (!confirmeParId) throw new Error("confirmeParId manquant");

    return prismaClient.mouvementEquipement.update({
      where: { id },
      data: { confirme: false, confirmeParId, dateConfirmation: new Date() },
    });
  }

  // ----------------- Récupération de tous les mouvements -----------------
// ----------------- Récupération de tous les mouvements -----------------
async getAllMouvements(
  page = 1,
  limit = 10,
  filters?: {
    type?: string;
    equipementId?: number;
    confirme?: boolean;
    search?: string;
  }
) {
  // 🔹 Pagination sécurisée
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), 100);
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  // 🔹 Filtres simples
  if (filters?.type) andConditions.push({ type: filters.type });
  if (filters?.equipementId) andConditions.push({ equipementId: filters.equipementId });
  if (filters?.confirme !== undefined) andConditions.push({ confirme: filters.confirme });

  // 🔹 Recherche sur le commentaire uniquement côté Prisma
  if (filters?.search) {
    andConditions.push({
      commentaire: { contains: filters.search, mode: "insensitive" },
    });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  // 🔹 Récupérer les mouvements avec relations
  const [data, totalCount] = await Promise.all([
    prismaClient.mouvementEquipement.findMany({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: "desc" },
      include: {
        equipement: true,
        initiateur: true,
        confirmePar: true,
        responsableDestination: { include: { agence: true } },
        agenceSource: true,
        agenceDestination: true,
        pointServiceSource: true,
        pointServiceDestination: true,
      },
    }),
    prismaClient.mouvementEquipement.count({ where }),
  ]);

  // 🔹 Filtrer côté JS pour la recherche sur le nom de l'équipement
  const filteredData = filters?.search
    ? data.filter(m => m.equipement?.nom.toLowerCase().includes(filters.search!.toLowerCase()))
    : data;

  return {
    data: filteredData,
    meta: {
      total: filteredData.length, // ou totalCount si tu veux la vraie pagination backend
      page,
      limit,
      totalPages: Math.ceil(filteredData.length / limit),
    },
  };
}


  async getMouvementById(id: number) {
    return prismaClient.mouvementEquipement.findUnique({
      where: { id },
      include: {
        equipement: true,
        initiateur: true,
        confirmePar: true,
        responsableDestination: { include: { agence: true } },
        agenceSource: true,
        agenceDestination: true,
        pointServiceSource: true,
        pointServiceDestination: true,
      },
    });
  }

  async updateMouvement(id: number, data: any) {
    const validated = updateMouvementSchema.parse(data);
    return prismaClient.mouvementEquipement.update({
      where: { id },
      data: { ...validated },
      include: {
        equipement: true,
        initiateur: true,
        confirmePar: true,
        responsableDestination: { include: { agence: true } },
        agenceSource: true,
        agenceDestination: true,
        pointServiceSource: true,
        pointServiceDestination: true,
      },
    });
  }
}
