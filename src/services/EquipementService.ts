import prismaClient from "../utils/prismaClient";
import { createEquipementSchema, updateEquipementSchema } from "../validations/equipementSchema";

export default class EquipementService {

  // 🔹 Créer un équipement
  async createEquipement(data: any) {
    const validated = createEquipementSchema.parse(data);

    // Transformer le tableau d'images en JSON si présent
    const dataToCreate = {
      ...validated,
      images: validated.images ? JSON.stringify(validated.images) : null,
    };

    return prismaClient.equipement.create({ data: dataToCreate });
  }

  // 🔹 Récupérer tous les équipements
  async getAllEquipements() {
    const list = await prismaClient.equipement.findMany({
      where: { archive: false },
      include: {
        affectations: {
          include: { 
            employe: true, 
            pointServiceOrigine: true,
            pointServiceDest: true
          } 
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return list.map(eq => ({
      ...eq,
      images: eq.images ? JSON.parse(eq.images) : [],
    }));
  }

async getEquipementById(id: number) {
  const eq = await prismaClient.equipement.findUnique({
    where: { id },
    include: {
      affectations: {
        include: { 
          employe: true, 
          pointServiceOrigine: true,
          pointServiceDest: true
        }
      }
    }
  });

  if (!eq) return null;

  return {
    ...eq,
    images: eq.images ? JSON.parse(eq.images) : [],
  };
}

  // 🔹 Mettre à jour un équipement
  async updateEquipement(id: number, data: any) {
    const validated = updateEquipementSchema.parse(data);

    const dataToUpdate = {
      ...validated,
      images: validated.images ? JSON.stringify(validated.images) : undefined, // undefined pour ne pas écraser si non fourni
    };

    return prismaClient.equipement.update({
      where: { id },
      data: dataToUpdate
    });
  }

  // 🔹 Archiver un équipement
  async archiveEquipement(id: number) {
    return prismaClient.equipement.update({
      where: { id },
      data: { archive: true, archivedAt: new Date() }
    });
  }

  // 🔹 Déclarer le status d’un équipement
  async declarerStatusEquipement(id: number, status: "ACTIF" | "HORS_SERVICE") {
    return prismaClient.equipement.update({
      where: { id },
      data: { status }
    });
  }
}
