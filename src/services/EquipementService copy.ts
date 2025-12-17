import prismaClient from "../utils/prismaClient";
import { createEquipementSchema, updateEquipementSchema } from "../validations/equipementSchema";
import { Equipement } from "../types/index";

interface EquipementFilters {
  nom?: string;
  categorie?: string;
  status?: string;
  proprietaireId?: number;
}

export default class EquipementService {

  // 🔹 Récupérer tous les équipements
  public async getAllEquipements(filters?: EquipementFilters): Promise<Equipement[]> {
    const where: any = { archive: false };

    if (filters) {
      if (filters.nom) where.nom = { contains: filters.nom, mode: "insensitive" };
      if (filters.categorie) where.categorie = { contains: filters.categorie, mode: "insensitive" };
      if (filters.status) where.status = filters.status;
      if (filters.proprietaireId) where.proprietaireId = filters.proprietaireId;
    }

    const list = await prismaClient.equipement.findMany({
      where,
      include: {
        proprietaire: true,
        affectations: {
          include: {
            employe: {
              include: {
                poste: true,
                agence: true,
                roles: true,
                chef: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return list.map(e => ({
      ...e,
      images: e.images ? JSON.parse(e.images) : [],
    }));
  }

  // 🔹 Récupérer un équipement par ID
 public async getEquipementById(id: number): Promise<Equipement | null> {
  if (!Number.isInteger(id) || id <= 0) throw new Error("ID d'équipement invalide");

  const equip = await prismaClient.equipement.findUnique({
    where: { id },
    include: {
      proprietaire: true,
      affectations: {
        include: {
          employe: {
            include: {
              poste: true,
              agence: true,
              chef: true,
              roles: {
                include: {
                  role: true
                }
              }
            }
          }
        }
      }
    },
  });


  if (!equip) return null;

  return {
    ...equip,
    images: equip.images ? JSON.parse(equip.images) : [],
  };
}


  // 🔹 Créer un équipement
  public async createEquipement(data: any): Promise<Equipement> {
    const validated = createEquipementSchema.parse(data);

    // Vérifier si le propriétaire existe
    if (validated.proprietaireId) {
      const proprietaire = await prismaClient.user.findUnique({
        where: { id: validated.proprietaireId },
      });
      if (!proprietaire) throw new Error("Propriétaire non trouvé");
    }

    // Images -> JSON
    const images = validated.images ? JSON.stringify(validated.images) : null;

    const equip = await prismaClient.equipement.create({
      data: {
        ...validated,
        images,
        quantiteDisponible: validated.quantiteTotale,
      },
      include: {
        proprietaire: true,
        affectations: true,
      },
    });

    return {
      ...equip,
      images: equip.images ? JSON.parse(equip.images) : [],
    };
  }

  // 🔹 Modifier un équipement
 public async updateEquipement(id: number, data: any): Promise<Equipement> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("ID invalide");

  const validated = updateEquipementSchema.parse(data);

  const equip = await prismaClient.equipement.findUnique({
    where: { id },
    include: { affectations: true },
  });

  if (!equip) throw new Error("Équipement non trouvé");

  if (validated.quantiteDisponible !== undefined)
    delete validated.quantiteDisponible;

  if (validated.quantiteTotale !== undefined) {
    const dejaAffecte = equip.affectations.reduce((s, a) => s + a.quantite, 0);

    if (validated.quantiteTotale < dejaAffecte)
      throw new Error(`Impossible : ${dejaAffecte} équipements déjà affectés`);

    validated.quantiteDisponible = validated.quantiteTotale - dejaAffecte;
  }

  // ---------------------------
  // 🔹 Transformation images
  // ---------------------------
  const dataToUpdate: any = {
    ...validated,
  };

  if (validated.images !== undefined) {
    dataToUpdate.images = JSON.stringify(validated.images); // jamais null
  }

  const updated = await prismaClient.equipement.update({
    where: { id },
    data: dataToUpdate,
    include: {
      proprietaire: true,
      affectations: true,
    },
  });

  return {
    ...updated,
    images: updated.images ? JSON.parse(updated.images) : [],
  };
}


 // services/EquipementService.ts (partie getEquipementsFiltered)
public async getEquipementsFiltered(agenceId?: number, posteId?: number): Promise<Equipement[]> {
  try {
    // construis le filtre employe uniquement si on a au moins une valeur
    const employeFilter: any = {};
    if (typeof agenceId === "number" && !Number.isNaN(agenceId)) employeFilter.agenceId = agenceId;
    if (typeof posteId === "number" && !Number.isNaN(posteId)) employeFilter.posteId = posteId;

    // where principal
    const where: any = { archive: false };

    // n'ajouter affectations.some que si employeFilter non vide
    if (Object.keys(employeFilter).length > 0) {
      where.affectations = {
        some: {
          employe: employeFilter,
        },
      };
    }

    const list = await prismaClient.equipement.findMany({
      where,
      include: {
        affectations: {
          include: {
            employe: {
              include: {
                poste: true,
                agence: true,
                roles: {
                  include: { role: true }
                },
                chef: true
              }
            }
          }
        },
        proprietaire: true
      },
      orderBy: { createdAt: "desc" },
    });

    return list.map(e => ({
      ...e,
      images: e.images ? JSON.parse(e.images) : [],
    }));
  } catch (err: any) {
    // remonter une erreur claire (le controller loggera le stack)
    throw new Error(`Erreur getEquipementsFiltered service: ${err.message}`);
  }
}




  // 🔹 Soft delete
  public async deleteEquipement(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID invalide");

    await prismaClient.equipement.update({
      where: { id },
      data: { archive: true, archivedAt: new Date() },
    });
  }

  // 🔹 Changer le statut
  public async declarerStatus(id: number, status: "ACTIF" | "HORS_SERVICE"): Promise<Equipement> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID invalide");

    if (!["ACTIF", "HORS_SERVICE"].includes(status)) {
      throw new Error("Status invalide");
    }

    return prismaClient.equipement.update({
      where: { id },
      data: { status },
    });
  }
}
