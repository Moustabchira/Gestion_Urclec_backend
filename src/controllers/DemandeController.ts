import { Request, Response } from "express";
import DemandeService from "../services/DemandeService";
import * as status from "../utils/constantes";
import { createDemandeSchema, updateDemandeSchema } from "../validations/demandeSchema";

const demandeService = new DemandeService();

export default class DemandeController {

  // Création d'une demande avec validation Zod
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createDemandeSchema.parse(req.body);
      const newDemande = await demandeService.createDemande(validated);
      res.status(status.HTTP_STATUS_CREATED).json(newDemande);
    } catch (error: any) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error.message });
    }
  }

  // Récupération de toutes les demandes avec pagination
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { data, total } = await demandeService.getAllDemandes(page, limit);

      res.status(status.HTTP_STATUS_OK).json({ data, total, page, limit });
    } catch (error: any) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  // Récupération d'une demande par ID
  public async getOne(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });
      return;
    }
    try {
      const demande = await demandeService.getDemandeById(id);
      if (!demande) {
        res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Demande non trouvée" });
        return;
      }
      res.status(status.HTTP_STATUS_OK).json(demande);
    } catch (error: any) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  // Mise à jour d'une demande avec validation Zod
  public async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });
      return;
    }
    try {
      const validated = updateDemandeSchema.parse(req.body);
      const updatedDemande = await demandeService.updateDemande(id, validated);
      res.status(status.HTTP_STATUS_OK).json(updatedDemande);
    } catch (error: any) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error.message });
    }
  }

  // Suppression d'une demande
  public async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });
      return;
    }
    try {
      await demandeService.deleteDemande(id);
      res.status(status.HTTP_STATUS_OK).json({ message: "Demande supprimée avec succès" });
    } catch (error: any) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}
