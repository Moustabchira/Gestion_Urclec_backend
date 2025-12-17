import { Request, Response } from "express";
import EquipementService from "../services/EquipementService";

const service = new EquipementService();

export default class EquipementController {

  // 🔹 Créer un équipement
  async create(req: Request, res: Response) {
    try {
      const data: any = { ...req.body };

      // Si des fichiers sont uploadés via multer
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        data.images = req.files.map((file: any) => file.filename);
      } else if (data.images) {
        // si frontend envoie JSON string ou array
        try {
          data.images = typeof data.images === "string" ? JSON.parse(data.images) : data.images;
        } catch {
          // fallback si JSON invalide
          data.images = data.images;
        }
      }

      const equipement = await service.createEquipement(data);
      res.status(201).json(equipement);
    } catch (err: any) {
      console.error("Erreur createEquipement:", err);
      res.status(400).json({ message: err.message });
    }
  }

  // 🔹 Récupérer tous les équipements
  async getAll(req: Request, res: Response) {
    try {
      const equipements = await service.getAllEquipements();
      res.json(equipements);
    } catch (err: any) {
      console.error("Erreur getAllEquipements:", err);
      res.status(400).json({ message: err.message });
    }
  }

  // 🔹 Récupérer un équipement par ID
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const equipement = await service.getEquipementById(id);
      if (!equipement) return res.status(404).json({ message: "Équipement non trouvé" });
      res.json(equipement);
    } catch (err: any) {
      console.error("Erreur getEquipementById:", err);
      res.status(400).json({ message: err.message });
    }
  }

  // 🔹 Mettre à jour un équipement
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const data: any = { ...req.body };

      // Gérer les images si upload ou JSON
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        data.images = req.files.map((file: any) => file.filename);
      } else if (data.images) {
        try {
          data.images = typeof data.images === "string" ? JSON.parse(data.images) : data.images;
        } catch {
          data.images = data.images;
        }
      }

      const updated = await service.updateEquipement(id, data);
      res.json(updated);
    } catch (err: any) {
      console.error("Erreur updateEquipement:", err);
      res.status(400).json({ message: err.message });
    }
  }

  // 🔹 Archiver un équipement
  async archive(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const archived = await service.archiveEquipement(id);
      res.json(archived);
    } catch (err: any) {
      console.error("Erreur archiveEquipement:", err);
      res.status(400).json({ message: err.message });
    }
  }

  // 🔹 Déclarer le statut d’un équipement
  async declarerStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await service.declarerStatusEquipement(id, status);
      res.json(updated);
    } catch (err: any) {
      console.error("Erreur declarerStatusEquipement:", err);
      res.status(400).json({ message: err.message });
    }
  }
}
