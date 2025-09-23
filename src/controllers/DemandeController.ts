import { Request, Response } from "express";
import DemandeService from "../services/DemandeService";
import { Demande } from "../types";
import * as status from "../utils/constantes";

const demandeService = new DemandeService();

export default class DemandeController {

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const demande: Demande = await demandeService.createDemande(req.body);
      res.status(status.HTTP_STATUS_CREATED).json(demande);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la création", error });
    }
  }

  public async getAll(req: Request, res: Response): Promise<void> {

    try {
      const demandes: Demande[] = await demandeService.getAllDemandes();
      res.json(demandes);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la récupération", error });
    }

  }

  public async getOne(req: Request, res: Response): Promise<void> {

    try {
      const demande = await demandeService.getDemandeById(Number(req.params.id));
      if (!demande) {
        res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Demande non trouvée" });
        return;
      }
      res.json(demande);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la récupération", error });
    }

  }

  public async update(req: Request, res: Response): Promise<void> {

    try {
      const demande = await demandeService.updateDemande(Number(req.params.id), req.body);
      res.json(demande);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la mise à jour", error });
    }

  }

  public async delete(req: Request, res: Response): Promise<void> {

    try {
      await demandeService.deleteDemande(Number(req.params.id));
      res.json({ message: "Demande supprimée avec succès" });
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la suppression", error });
    }

  }
}
