import { Request, Response } from "express";
import PosteService from "../services/PosteService";

const posteService = new PosteService();

export default class PosteController {

  public async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = { nom: req.query.nom as string | undefined };

      const postes = await posteService.getAllPostes(page, limit, filters);
      res.json(postes);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const poste = await posteService.getPosteById(id);
      res.json(poste);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const poste = await posteService.createPoste(req.body);
      res.status(201).json(poste);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const poste = await posteService.updatePoste(id, req.body);
      res.json(poste);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const poste = await posteService.deletePoste(id);
      res.json(poste);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
