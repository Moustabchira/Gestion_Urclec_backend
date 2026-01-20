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
  async getAllMouvements(filter?: any) {
    return prismaClient.mouvementEquipement.findMany({
      where: filter,
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
    });
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
