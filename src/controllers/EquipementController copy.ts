import { Request, Response } from "express";
import EquipementService from "../services/EquipementService";
import { Equipement } from "../types/index";

const service = new EquipementService();

export default class EquipementController {
  
  // 🔹 Récupérer tous les équipements
  async getAll(req: Request, res: Response) {
    try {
      const filters = req.query as any; 
      const equipements: Equipement[] = await service.getAllEquipements(filters);
      res.json(equipements);
    } catch (error: any) {
      console.error("Erreur getAllEquipements:", error);
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Récupérer un équipement par ID
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      const equipement: Equipement | null = await service.getEquipementById(id);

      if (!equipement)
        return res.status(404).json({ message: "Équipement non trouvé" });

      res.json(equipement);

    } catch (error: any) {
      console.error("Erreur getEquipementById:", error);
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Créer un équipement
  async create(req: Request, res: Response) {
    try {
      console.log("==== Création d'équipement ====");
      console.log("Body reçu :", req.body);

      const data = req.body;
      const formattedData: any = {
        ...data,
        quantiteTotale: data.quantiteTotale !== undefined ? Number(data.quantiteTotale) : undefined,
        quantiteDisponible: data.quantiteDisponible !== undefined ? Number(data.quantiteDisponible) : undefined,
        dateAcquisition: data.dateAcquisition ? new Date(data.dateAcquisition) : undefined,
        proprietaireId: data.proprietaireId ? Number(data.proprietaireId) : undefined,
      };

      // Si des fichiers sont uploadés par multer
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        formattedData.images = req.files.map((file: any) => file.filename);
      } else if (data.images) {
        // cas où le frontend envoie un JSON d'URLs/noms (string ou array)
        try {
          formattedData.images = typeof data.images === "string" ? JSON.parse(data.images) : data.images;
        } catch {
          formattedData.images = data.images;
        }
      }

      // validation / conversion minimale : assure quantiteTotale si fourni
      if (formattedData.quantiteTotale !== undefined) formattedData.quantiteTotale = Number(formattedData.quantiteTotale);

      const created: Equipement = await service.createEquipement(formattedData);
      res.status(201).json(created);
    } catch (error: any) {
      console.error("Erreur createEquipement:", error);
      res.status(400).json({ message: error.message || "Erreur lors de la création de l'équipement" });
    }
  }

  // 🔹 Mettre à jour un équipement
  async update(req: Request, res: Response) {
    try {
      console.log("==== Mise à jour d'équipement ====");
      console.log("Paramètres :", req.params);
      console.log("Body reçu :", req.body);
      console.log("Files reçus :", req.files);

      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID invalide" });
      }

      const data = req.body;
      const formattedData: any = {
        ...data,
        quantiteTotale: data.quantiteTotale !== undefined ? Number(data.quantiteTotale) : undefined,
        quantiteDisponible: data.quantiteDisponible !== undefined ? Number(data.quantiteDisponible) : undefined,
        dateAcquisition: data.dateAcquisition ? new Date(data.dateAcquisition) : undefined,
        proprietaireId: data.proprietaireId ? Number(data.proprietaireId) : undefined,
      };

      // Si des fichiers sont uploadés par multer -> remplacer / ajouter la liste d'images
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        formattedData.images = req.files.map((file: any) => file.filename);
        console.log("Images uploadées :", formattedData.images);
      } else if (data.images) {
        // si frontend a envoyé images comme JSON string ou array
        try {
          formattedData.images = typeof data.images === "string" ? JSON.parse(data.images) : data.images;
        } catch {
          formattedData.images = data.images;
        }
      }

      const updated: Equipement = await service.updateEquipement(id, formattedData);
      res.status(200).json(updated);
    } catch (error: any) {
      console.error("Erreur updateEquipement:", error);
      res.status(400).json({ message: error.message || "Erreur lors de la mise à jour de l'équipement" });
    }
  }

 // controllers/EquipementController.ts (méthode getFiltered)
async getFiltered(req: Request, res: Response) {
  try {
    // parse et validation simple
    const rawAgence = req.query.agenceId;
    const rawPoste = req.query.posteId;

    const agenceId = rawAgence !== undefined && rawAgence !== "" ? Number(rawAgence) : undefined;
    const posteId = rawPoste !== undefined && rawPoste !== "" ? Number(rawPoste) : undefined;

    if (agenceId !== undefined && (!Number.isInteger(agenceId) || agenceId <= 0)) {
      return res.status(400).json({ message: "Paramètre agenceId invalide" });
    }
    if (posteId !== undefined && (!Number.isInteger(posteId) || posteId <= 0)) {
      return res.status(400).json({ message: "Paramètre posteId invalide" });
    }

    const equipements: Equipement[] = await service.getEquipementsFiltered(agenceId, posteId);
    return res.json(equipements);
  } catch (error: any) {
    // log complet pour debug (stack)
    console.error("Erreur getEquipementsFiltered:", error);
    return res.status(400).json({ message: error.message || "Erreur getFiltered" });
  }
}


  // 🔹 Supprimer un équipement (soft delete)
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      await service.deleteEquipement(id);

      res.json({ message: "Équipement archivé avec succès" });

    } catch (error: any) {
      console.error("Erreur deleteEquipement:", error);
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Déclarer le statut d’un équipement
  async declarerStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      const updated = await service.declarerStatus(id, status);

      res.json(updated);

    } catch (error: any) {
      console.error("Erreur declarerStatus:", error);
      res.status(400).json({ message: error.message });
    }
  }
}
