import prismaClient from "../utils/prismaClient";
import { 
  createAffectationSchema, 
  updateAffectationStatusSchema 
} from "../validations/equipementSchema";

export default class AffectationService {

  // 🔹 Créer une affectation
  async affecterEquipement(data: any) {
    // Validation Zod
    const validated = createAffectationSchema.parse(data);

    return prismaClient.affectationEquipement.create({
      data: {
        equipementId: validated.equipementId,
        employeId: validated.employeId,
        quantite: validated.quantite,
        status: validated.status || "BON",

        // 🔥 IMPORTANT : tu ne les mettais PAS avant
        pointServiceOrigineId: validated.pointServiceOrigineId,
        pointServiceDestId: validated.pointServiceDestId,

        archive: false
      },
      include: { 
        employe: true, 
        equipement: true, 
        pointServiceOrigine: true,
        pointServiceDest: true
      }
    });
  }

  // 🔹 Changer le status d’une affectation
  async changerStatusAffectation(id: number, status: string) {
    updateAffectationStatusSchema.parse({ status });

    return prismaClient.affectationEquipement.update({
      where: { id },
      data: { status }
    });
  }

  // 🔹 Retirer une affectation (marquer terminée)
  async retirerAffectation(id: number) {
    return prismaClient.affectationEquipement.update({
      where: { id },
      data: { 
        status: "RETIRE",
        dateFin: new Date()
      }
    });
  }

  // 🔹 Affectations en cours
  async getAffectationsEnCours() {
    return prismaClient.affectationEquipement.findMany({
      where: { 
        dateFin: null, 
        archive: false 
      },
      include: { 
        employe: true, 
        equipement: true, 
        pointServiceOrigine: true,
        pointServiceDest: true 
      }
    });
  }

  // 🔹 Historique complet
  async getHistorique() {
    return prismaClient.affectationEquipement.findMany({
      include: {
        employe: { include: { agence: true } },
        equipement: true,
        pointServiceOrigine: { include: { agence: true } },
        pointServiceDest: { include: { agence: true } },
      },
    });
  }
}
