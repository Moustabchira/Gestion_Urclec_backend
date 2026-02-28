import { Request, Response } from "express";
import PosteService, { UpdatePosteData } from "../services/PosteService";
import * as status from "../utils/constantes";

const posteService = new PosteService();

export default class PosteController {

  // 🔹 Valider l'ID
  private parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  // 🔹 Récupérer tous les postes avec pagination et filtre
  public async getAllPostes(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = { nom: req.query.nom as string | undefined };

    try {
      const result = await posteService.getAllPostes(page, limit, filters);

      res.status(status.HTTP_STATUS_OK).json({
        data: result.data,
        meta: {
          total: result.total,
          page,
          lastPage: Math.ceil(result.total / limit),
        },
      });
    } catch (error: any) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // 🔹 Récupérer un poste par ID
  public async getPosteById(req: Request, res: Response) {
    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID Poste invalide" });

    try {
      const poste = await posteService.getPosteById(id);
      if (!poste) return res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Poste non trouvé" });
      res.status(status.HTTP_STATUS_OK).json(poste);
    } catch (error: any) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // 🔹 Créer un poste
  public async createPoste(req: Request, res: Response) {
    try {
      const poste = await posteService.createPoste(req.body);
      res.status(status.HTTP_STATUS_CREATED).json(poste);
    } catch (error: any) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // 🔹 Mettre à jour un poste
  public async updatePoste(req: Request, res: Response) {
    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID Poste invalide" });

    try {
      const updatedPoste = await posteService.updatePoste(id, req.body as UpdatePosteData);
      res.status(status.HTTP_STATUS_OK).json(updatedPoste);
    } catch (error: any) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // 🔹 Supprimer un poste (soft delete)
  public async deletePoste(req: Request, res: Response) {
    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID Poste invalide" });

    try {
      const deletedPoste = await posteService.deletePoste(id);
      res.status(status.HTTP_STATUS_OK).json(deletedPoste);
    } catch (error: any) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }
}