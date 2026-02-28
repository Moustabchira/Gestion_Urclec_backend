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
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);

    const filters = {
      type: req.query.type as string | undefined,
      equipementId: req.query.equipementId
        ? Number(req.query.equipementId)
        : undefined,
      confirme:
        req.query.confirme !== undefined
          ? req.query.confirme === "true"
          : undefined,
      search: req.query.search as string | undefined,
    };

    const result = await mouvementService.getAllMouvements(
      page,
      limit,
      filters
    );

    res.json({
      data: result.data,
      meta: result.meta,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


  async getByEquipement(req: Request, res: Response) {
  try {
    const equipementId = Number(req.params.equipementId);

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);

    const result = await mouvementService.getAllMouvements(
      page,
      limit,
      { equipementId }
    );

    res.json({
      data: result.data,
      meta: result.meta,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

}
