import { Request, Response } from "express";
import DemandeService from "../services/DemandeService";
import * as status from "../utils/constantes";
import { createDemandeSchema, updateDemandeSchema } from "../validations/demandeSchema";
import { generateDemandePdf } from "../utils/pdfGeneretor";

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

  // Mise à jour d'une demande
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

  // ---------- Prendre une décision hiérarchique ----------
    public async prendreDecision(req: Request, res: Response): Promise<void> {
      const demandeId = Number(req.params.demandeId);
      if (isNaN(demandeId) || demandeId <= 0) {
        res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID de demande invalide" });
        return;
      }

      const { userId, status: decisionStatus } = req.body;
      if (!userId || !decisionStatus || !["APPROUVE", "REFUSE"].includes(decisionStatus)) {
        res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "Données de décision invalides" });
        return;
      }

      try {
        const updatedDemande = await demandeService.prendreDecision(demandeId, userId, decisionStatus);
        res.status(status.HTTP_STATUS_OK).json(updatedDemande);
      } catch (error: any) {
        res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error.message });
      }
    }

    public async generatePdf(req: Request, res: Response): Promise<void> {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ message: "ID invalide" });
        return;
      }

      try {
        const demande = await demandeService.getDemandeById(id);
        if (!demande) {
          res.status(404).json({ message: "Demande introuvable" });
          return;
        }

        generateDemandePdf(demande, res); // appel à la fonction utilitaire

      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }

}
