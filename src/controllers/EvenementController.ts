import { Request, Response } from "express";
import EvenementService from "../services/EvenementService";
import * as status from "../utils/constantes";

const evenementService = new EvenementService();

export default class EvenementController {

  private parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  public async getAllEvenements(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const filters = {
        titre: req.query.titre ? String(req.query.titre) : undefined,
        description: req.query.description ? String(req.query.description) : undefined,
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        archive: req.query.archive !== undefined ? req.query.archive === "true" : undefined,
      };

      const result = await evenementService.getEvenements(page, limit, filters);
      res.status(status.HTTP_STATUS_OK).json(result);

    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR)
         .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async getEvenementById(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID d'événement invalide" });
      return;
    }

    try {
      const evenement = await evenementService.getEvenementById(id);
      if (!evenement) {
        res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Événement non trouvé" });
        return;
      }
      res.status(status.HTTP_STATUS_OK).json(evenement);

    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR)
         .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async createEvenement(req: Request, res: Response): Promise<void> {
    try {
      const newEvenement = await evenementService.createEvenement(req.body);
      res.status(status.HTTP_STATUS_CREATED).json(newEvenement);

    } catch (error) {
      res.status(status.HTTP_STATUS_BAD_REQUEST)
         .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async updateEvenement(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID d'événement invalide" });
      return;
    }

    try {
      const updated = await evenementService.updateEvenement(id, req.body);
      res.status(status.HTTP_STATUS_OK).json(updated);

    } catch (error) {
      res.status(status.HTTP_STATUS_BAD_REQUEST)
         .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async deleteEvenement(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID d'événement invalide" });
      return;
    }

    try {
      await evenementService.deleteEvenement(id);
      res.status(status.HTTP_STATUS_OK).json({ message: "Événement supprimé avec succès" });

    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR)
         .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }
}
