import prismaClient from "../utils/prismaClient";
import { createCreditSchema, updateCreditSchema } from "../validations/creditSchema";

export default class CreditService {
  async getCredits() {
    return prismaClient.credit.findMany({
      include: { actions: true, histories: true, beneficiaire: true },
    });
  }

  async getCreditById(id: number) {
    return prismaClient.credit.findUnique({
      where: { id },
      include: { actions: true, histories: true, beneficiaire: true },
    });
  }

  async createCredit(data: unknown) {
    const validated = createCreditSchema.parse(data);

    // ✅ Convertir les dates en objets Date
    const dataToCreate = {
      ...validated,
      tauxInteret: validated.tauxInteret ?? 0,
      dateDebut: new Date(validated.dateDebut),
      dateFin: new Date(validated.dateFin),
    };

    return prismaClient.credit.create({ data: dataToCreate });
  }

  async updateCredit(id: number, data: unknown) {
    const validated = updateCreditSchema.parse(data);

    const oldCredit = await this.getCreditById(id);
    if (!oldCredit) throw new Error("Crédit introuvable");

    type CreditKeys = keyof typeof validated;

    // Enregistrer l'historique
    for (const key of Object.keys(validated) as CreditKeys[]) {
      const oldValue = oldCredit[key as keyof typeof oldCredit];
      const newValue = validated[key];

      if (oldValue !== newValue) {
        await prismaClient.creditHistory.create({
          data: {
            creditId: id,
            field: key,
            oldValue: oldValue?.toString() || null,
            newValue: newValue?.toString() || null,
          },
        });
      }
    }

    // ✅ Convertir les dates si elles existent
    const updateData = {
      ...validated,
      ...(validated.dateDebut && { dateDebut: new Date(validated.dateDebut) }),
      ...(validated.dateFin && { dateFin: new Date(validated.dateFin) }),
    };

    return prismaClient.credit.update({
      where: { id },
      data: updateData,
    });
  }

  async archiveCredit(id: number) {
    return this.updateCredit(id, { archive: true, archivedAt: new Date() });
  }
}
