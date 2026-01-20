import { Request, Response } from "express";
import EquipementService from "../services/EquipementService";

const equipementService = new EquipementService();

export default class EquipementController {

  // ----------------- Création d’équipement -----------------
  async create(req: Request, res: Response) {
    try {
      const data: any = { ...req.body };

      // Gestion des fichiers uploadés
      if (req.files && Array.isArray(req.files)) {
        data.images = req.files.map((file: any) => file.filename);
      } else if (data.images && typeof data.images === "string") {
        try { data.images = JSON.parse(data.images); } catch { }
      }

      const equipement = await equipementService.createEquipement(data);
      res.status(201).json(equipement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const equipements = await equipementService.getAllEquipements();
      res.json(equipements);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const equipement = await equipementService.getEquipementById(id);
      if (!equipement) return res.status(404).json({ error: "Équipement non trouvé" });
      res.json(equipement);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data: any = { ...req.body };
      if (req.files && Array.isArray(req.files)) data.images = req.files.map((file: any) => file.filename);

      const equipement = await equipementService.updateEquipement(id, data);
      res.json(equipement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async archive(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const equipement = await equipementService.archiveEquipement(id);
      res.json(equipement);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // ----------------- Déclaration état & status -----------------
  async declarerEtat(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { etat } = req.body;
      const equipement = await equipementService.declarerEtatEquipement(id, etat);
      res.json(equipement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async declarerStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const equipement = await equipementService.declarerStatusEquipement(id, status);
      res.json(equipement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // ----------------- Affectation -----------------
  async affecter(req: Request, res: Response) {
    try {
      const data: any = req.body;
      ["equipementId", "initiateurId", "employeId", "pointServiceDestinationId"].forEach(key => { if (data[key]) data[key] = Number(data[key]); });

      const mouvement = await equipementService.affecterEquipement(data);
      res.json(mouvement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // ----------------- Transfert -----------------
  async transferer(req: Request, res: Response) {
    try {
      const data: any = req.body;
      ["equipementId", "initiateurId", "agenceSourceId", "agenceDestinationId", "pointServiceSourceId", "pointServiceDestinationId", "responsableDestinationId"]
        .forEach(key => { if (data[key]) data[key] = Number(data[key]); });

      const mouvement = await equipementService.transfererEquipement(data);
      res.json(mouvement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

 // ================= CONTROLEUR =================
async envoyerEnReparation(req: Request, res: Response) {
  try {
    console.log("Request body:", req.body);

    const data = {
      equipementId: Number(req.body.equipementId),
      initiateurId: Number(req.body.initiateurId),
      reparateurId: Number(req.body.reparateurId),
      agenceSourceId: req.body.agenceSourceId
        ? Number(req.body.agenceSourceId)
        : undefined,
      pointServiceSourceId: req.body.pointServiceSourceId
        ? Number(req.body.pointServiceSourceId)
        : undefined,
      descriptionPanne: req.body.commentaire ?? "", // 🔑 obligatoire
    };

    const mouvement = await equipementService.envoyerEnReparation(data);
    res.status(201).json(mouvement);
  } catch (err: any) {
    console.error("envoyerEnReparation error:", err);
    res.status(400).json({ error: err.message });
  }
}



async retourDeReparation(req: Request, res: Response) {
  try {
    const data = {
      mouvementId: Number(req.body.mouvementId),
      initiateurId: Number(req.body.initiateurId), // réparateur
      etatFinal: req.body.etatFinal as "FONCTIONNEL" | "EN_PANNE",
    };

    if (!data.etatFinal) {
      throw new Error("etatFinal est obligatoire (FONCTIONNEL | EN_PANNE)");
    }

    const result = await equipementService.retourDeReparation(data);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}



  // ----------------- Confirmation de réception -----------------
  async confirmerReception(req: Request, res: Response) {
    try {
      const mouvementId = Number(req.body.mouvementId);
      const confirmeParId = Number(req.body.confirmeParId);
      const mouvement = await equipementService.confirmerReception(mouvementId, confirmeParId);
      res.json(mouvement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // ----------------- Historique des mouvements -----------------
  async getMouvements(req: Request, res: Response) {
    try {
      const equipementId = Number(req.params.id);
      const filter = req.query || {};
      const mouvements = await equipementService.getMouvementsEquipement(equipementId, filter);
      res.json(mouvements);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
