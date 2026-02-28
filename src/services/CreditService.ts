import prismaClient from "../utils/prismaClient";
import { createCreditSchema, updateCreditSchema } from "../validations/creditSchema";

export default class CreditService {

  // 🔹 Tous les crédits paginés
  public async getCredits(
    page = 1,
    limit = 10
  ): Promise<{
    data: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prismaClient.credit.findMany({
        where: { archive: false },
        include: { beneficiaire: true, agent: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prismaClient.credit.count({ where: { archive: false } }),
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

  // 🔹 Crédits impayés paginés
  public async getCreditsImpayes(
    page = 1,
    limit = 10
  ): Promise<{
    data: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * limit;

    const where = {
      archive: false,
      status: "EN_COURS",
      montant: { gt: prismaClient.credit.fields.montantRembourse },
    };

    const [data, total] = await Promise.all([
      prismaClient.credit.findMany({
        where,
        include: { beneficiaire: true, agent: true, actions: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prismaClient.credit.count({ where }),
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

  // 🔹 Crédit par ID
  public async getCreditById(id: number) {
    return prismaClient.credit.findUnique({
      where: { id },
      include: { beneficiaire: true, agent: true, actions: true, histories: true },
    });
  }

  // 🔹 CRÉATION
  public async createCredit(data: unknown) {
    const validated = createCreditSchema.parse(data);

    return prismaClient.credit.create({
      data: {
        reference: `CR-${Date.now()}`,
        beneficiaireId: validated.beneficiaireId,
        agentId: validated.agentId,
        montant: validated.montant,
        tauxInteret: validated.tauxInteret ?? 0,
        dateDebut: new Date(validated.dateDebut),
        dateFin: new Date(validated.dateFin),
        status: validated.status ?? "EN_COURS",
      },
    });
  }

  // 🔹 MISE À JOUR + HISTORIQUE
  public async updateCredit(id: number, data: unknown) {
    const validated = updateCreditSchema.parse(data);

    const oldCredit = await prismaClient.credit.findUnique({ where: { id } });
    if (!oldCredit) throw new Error("Crédit introuvable");

    // Historique automatique
    for (const key of Object.keys(validated)) {
      const oldValue = (oldCredit as any)[key];
      const newValue = (validated as any)[key];
      if (oldValue !== undefined && oldValue !== newValue) {
        await prismaClient.creditHistory.create({
          data: {
            creditId: id,
            field: key,
            oldValue: oldValue?.toString() ?? null,
            newValue: newValue?.toString() ?? null,
          },
        });
      }
    }

    return prismaClient.credit.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.dateDebut && { dateDebut: new Date(validated.dateDebut) }),
        ...(validated.dateFin && { dateFin: new Date(validated.dateFin) }),
        ...(validated.archivedAt && { archivedAt: new Date(validated.archivedAt) }),
      },
    });
  }

  // 🔹 ARCHIVER
  public async archiveCredit(id: number) {
    return prismaClient.credit.update({
      where: { id },
      data: { archive: true, archivedAt: new Date() },
    });
  }

  // 🔹 Crédits impayés par agent
  public async getCreditsImpayesByAgent(
    agentId: number,
    page = 1,
    limit = 10
  ): Promise<{
    data: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * limit;

    const where = {
      agentId,
      archive: false,
      status: "EN_COURS",
      montant: { gt: prismaClient.credit.fields.montantRembourse },
    };

    const [data, total] = await Promise.all([
      prismaClient.credit.findMany({
        where,
        include: { beneficiaire: true, actions: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prismaClient.credit.count({ where }),
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
}