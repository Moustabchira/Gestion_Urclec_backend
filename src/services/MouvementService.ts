import prismaClient from "../utils/prismaClient";
import { createMouvementSchema, updateMouvementSchema } from "../validations/equipementSchema";

export default class MouvementService {

  // ----------------- Création d’un mouvement -----------------
  async createMouvement(data: any, prisma = prismaClient) {
    const result = createMouvementSchema.safeParse(data);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Erreur de validation";
      throw new Error(message);
    }

    const validated = result.data;

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
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters?.type) where.type = filters.type;
  if (filters?.equipementId) where.equipementId = filters.equipementId;
  if (filters?.confirme !== undefined) where.confirme = filters.confirme;

  if (filters?.search?.trim()) {
    const term = filters.search.trim();
    where.OR = [
      { commentaire: { contains: term, mode: "insensitive" } },
      { type: { contains: term, mode: "insensitive" } },
      { equipement: { is: { nom: { contains: term, mode: "insensitive" } } } },
      { initiateur: { is: { nom: { contains: term, mode: "insensitive" } } } },
      { initiateur: { is: { prenom: { contains: term, mode: "insensitive" } } } },
      { pointServiceSource: { is: { nom: { contains: term, mode: "insensitive" } } } },
      { pointServiceDestination: { is: { nom: { contains: term, mode: "insensitive" } } } },
    ];
  }

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

  return {
    data,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
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
    const result = updateMouvementSchema.safeParse(data);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Erreur de validation";
      throw new Error(message);
    }

    const validated = result.data;  
    
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
