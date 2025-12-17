// controllers/PointServiceController.ts
import { Request, Response } from "express";
import PointService from "../services/PointService";

const pointService = new PointService();

export default class PointServiceController {

  // 🔹 Récupérer tous
  public async getAll(req: Request, res: Response) {
    try {
      const filters = {
        nom: req.query.nom as string | undefined,
        agenceId: req.query.agenceId ? parseInt(req.query.agenceId as string) : undefined,
      };

      const points = await pointService.getAllPoints(filters);
      res.json(points);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Récupérer par ID
  public async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const point = await pointService.getPointById(id);
      res.json(point);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Créer
  public async create(req: Request, res: Response) {
    try {
      const point = await pointService.createPoint(req.body);
      res.status(201).json(point);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Mettre à jour
  public async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const point = await pointService.updatePoint(id, req.body);
      res.json(point);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Supprimer
  public async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const point = await pointService.deletePoint(id);
      res.json(point);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
