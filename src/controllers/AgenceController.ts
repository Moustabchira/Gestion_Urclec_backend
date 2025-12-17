import { Request, Response } from "express";
import AgenceService, { UpdateAgenceData } from "../services/AgenceService";
import * as status from "../utils/constantes";

const agenceService = new AgenceService();

export default class AgenceController {

  private parseId(value: string): number | null {

    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;

  }

  public async getAllAgences(req: Request, res: Response) {

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters = {
      nom_agence: req.query.nom_agence as string,
      code_agence: req.query.code_agence as string,
      ville: req.query.ville as string,
    };

    try {
      const result = await agenceService.getAllAgences(page, limit, filters);
      res.status(status.HTTP_STATUS_OK).json({
        data: result.data,
        meta: {
          total: result.total,
          page,
          lastPage: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async getAgenceById(req: Request, res: Response) {

    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID Agence invalide" });

    try {
      const agence = await agenceService.getAgenceById(id);
      if (!agence) return res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Agence non trouvée" });
      res.status(status.HTTP_STATUS_OK).json(agence);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }

  }

  public async createAgence(req: Request, res: Response) {

    try {
      const agence = await agenceService.createAgence(req.body);
      res.status(status.HTTP_STATUS_CREATED).json(agence);
    } catch (error) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }

  }

  public async updateAgence(req: Request, res: Response) {

    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID Agence invalide" });

    try {
      const updatedAgence = await agenceService.updateAgence(id, req.body as UpdateAgenceData);
      res.status(status.HTTP_STATUS_OK).json(updatedAgence);
    } catch (error) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }

  }

  public async deleteAgence(req: Request, res: Response) {

    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID Agence invalide" });

    try {
      const deletedAgence = await agenceService.deleteAgence(id);
      res.status(status.HTTP_STATUS_OK).json(deletedAgence);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
    
  }
}
