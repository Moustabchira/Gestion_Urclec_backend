import prismaClient from "../utils/prismaClient";
import { createActionSchema, updateActionSchema } from "../validations/ActionCreditSchema";

export default class ActionCreditService {
  
  // 🔹 Toutes les actions (historique global, paginated)
  async getAllActionsPaginated(page = 1, limit = 10) {
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prismaClient.actionCredit.findMany({
        where: { archive: false },
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          agent: { select: { id: true, nom: true, prenom: true } },
          credit: {
            include: {
              beneficiaire: { select: { id: true, nom: true, prenom: true } },
            },
          },
        },
      }),
      prismaClient.actionCredit.count({ where: { archive: false } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 🔹 Actions d’un crédit (paginated)
  async getActionsByCreditPaginated(creditId: number, page = 1, limit = 10) {
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prismaClient.actionCredit.findMany({
        where: { creditId, archive: false },
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          agent: { select: { id: true, nom: true, prenom: true } },
        },
      }),
      prismaClient.actionCredit.count({ where: { creditId, archive: false } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 🔹 Toutes les actions d’un crédit (non paginated)
  async getActionsByCredit(creditId: number) {
    return prismaClient.actionCredit.findMany({
      where: { creditId, archive: false },
      orderBy: { date: "desc" },
      include: {
        agent: { select: { id: true, nom: true, prenom: true } },
      },
    });
  }

  // 🔹 CRÉATION ACTION
  async createAction(data: unknown) {
    const validated = createActionSchema.parse(data);

    return prismaClient.actionCredit.create({
      data: {
        creditId: validated.creditId,
        agentId: validated.agentId,
        type: validated.type,
        commentaire: validated.commentaire ?? null,
        date: validated.date ? new Date(validated.date) : undefined,
      },
    });
  }

  // 🔹 MISE À JOUR ACTION
  async updateAction(id: number, data: unknown) {
    const validated = updateActionSchema.parse(data);

    return prismaClient.actionCredit.update({
      where: { id },
      data: {
        type: validated.type,
        commentaire: validated.commentaire ?? null,
        archive: validated.archive,
        archivedAt: validated.archivedAt ? new Date(validated.archivedAt) : undefined,
      },
    });
  }

  // 🔹 ARCHIVER ACTION
  async archiveAction(id: number) {
    return prismaClient.actionCredit.update({
      where: { id },
      data: {
        archive: true,
        archivedAt: new Date(),
      },
    });
  }

  // 🔹 SUPPRESSION DÉFINITIVE (optionnelle)
  async deleteAction(id: number) {
    return prismaClient.actionCredit.delete({
      where: { id },
    });
  }
}