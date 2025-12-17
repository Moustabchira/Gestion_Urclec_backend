import prismaClient from "../utils/prismaClient";
import {
  createActionSchema,
  updateActionSchema,
} from "../validations/ActionCreditSchema";

export default class ActionCreditService {
  // 🔹 Actions par crédit
  async getActionsByCredit(creditId: number) {
    return prismaClient.actionCredit.findMany({
      where: {
        creditId,
        archive: false,
      },
      include: {
        agent: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  // 🔹 Créer une action
  async createAction(data: unknown) {
    const validated = createActionSchema.parse(data);

    return prismaClient.actionCredit.create({
      data: {
        // relations
        credit: {
          connect: { id: validated.creditId },
        },
        agent: {
          connect: { id: validated.agentId },
        },

        // champs simples
        type: validated.type,
        commentaire: validated.commentaire ?? null,
        latitude: validated.latitude ?? null,
        longitude: validated.longitude ?? null,

        // date & archive gérés par Prisma
      },
    });
  }

  // 🔹 Mettre à jour une action
  async updateAction(id: number, data: unknown) {
    const validated = updateActionSchema.parse(data);

    return prismaClient.actionCredit.update({
      where: { id },
      data: {
        type: validated.type,
        commentaire: validated.commentaire ?? null,
        latitude: validated.latitude ?? null,
        longitude: validated.longitude ?? null,
      },
    });
  }

  // 🔹 Archiver une action
  async archiveAction(id: number) {
    return prismaClient.actionCredit.update({
      where: { id },
      data: {
        archive: true,
        archivedAt: new Date(),
      },
    });
  }

  // 🔹 Supprimer définitivement (optionnel)
  async deleteAction(id: number) {
    return prismaClient.actionCredit.delete({
      where: { id },
    });
  }
}
