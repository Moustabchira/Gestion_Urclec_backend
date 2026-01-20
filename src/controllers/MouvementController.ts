import { Request, Response } from "express";
import MouvementService from "../services/MouvementService";

const mouvementService = new MouvementService();

export default class MouvementController {

  async create(req: Request, res: Response) {
    try {
      const data: any = req.body;
      ["equipementId", "initiateurId", "responsableDestinationId", "agenceSourceId", "agenceDestinationId", "pointServiceSourceId", "pointServiceDestinationId", "confirmeParId"]
        .forEach(key => { if (data[key]) data[key] = Number(data[key]); });

      const mouvement = await mouvementService.createMouvement(data);
      res.status(201).json(mouvement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async confirmer(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const confirmeParId = Number(req.body.confirmeParId);
      const mouvement = await mouvementService.confirmerMouvement(id, confirmeParId);
      res.json(mouvement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async rejeter(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const confirmeParId = Number(req.body.confirmeParId);
      const mouvement = await mouvementService.rejeterMouvement(id, confirmeParId);
      res.json(mouvement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const filter = req.query || {};
      const mouvements = await mouvementService.getAllMouvements(filter);
      res.json(mouvements);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getByEquipement(req: Request, res: Response) {
    try {
      const equipementId = Number(req.params.equipementId);
      const mouvements = await mouvementService.getAllMouvements({ equipementId });
      res.json(mouvements);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
