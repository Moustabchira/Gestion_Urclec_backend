import { Request, Response } from "express";
import DemandeService from "../services/DemandeService";
import * as status from "../utils/constantes";
import { createDemandeSchema, updateDemandeSchema } from "../validations/demandeSchema";
import { generateDemandePdf } from "../utils/pdfGeneretor";

const demandeService = new DemandeService();

export default class DemandeController {

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const validated = createDemandeSchema.parse(req.body);
      const newDemande = await demandeService.createDemande(validated);
      return res.status(status.HTTP_STATUS_CREATED).json(newDemande);
    } catch (error: any) {
      return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error.message });
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const filters = {
        type: req.query.type as string,
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        status: req.query.status as string,
      };
      const { data, total } = await demandeService.getAllDemandes(page, limit, filters);
      return res.status(status.HTTP_STATUS_OK).json({ data, total, page, limit });
    } catch (error: any) {
      return res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  public async getOne(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });

    try {
      const demande = await demandeService.getDemandeById(id);
      if (!demande) return res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Demande non trouvée" });
      return res.status(status.HTTP_STATUS_OK).json(demande);
    } catch (error: any) {
      return res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });

    try {
      const validated = updateDemandeSchema.parse(req.body);
      const updatedDemande = await demandeService.updateDemande(id, validated);
      return res.status(status.HTTP_STATUS_OK).json(updatedDemande);
    } catch (error: any) {
      return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });

    try {
      await demandeService.deleteDemande(id);
      return res.status(status.HTTP_STATUS_OK).json({ message: "Demande supprimée avec succès" });
    } catch (error: any) {
      return res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  public async prendreDecision(req: Request, res: Response): Promise<Response> {
    const demandeId = Number(req.params.demandeId);
    if (isNaN(demandeId) || demandeId <= 0) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID de demande invalide" });

    const { userId, status: decisionStatus } = req.body;
    if (!userId || !decisionStatus || !["APPROUVE", "REFUSE"].includes(decisionStatus))
      return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "Données de décision invalides" });

    try {
      const updatedDemande = await demandeService.prendreDecision(demandeId, userId, decisionStatus);
      return res.status(status.HTTP_STATUS_OK).json(updatedDemande);
    } catch (error: any) {
      return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error.message });
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
      generateDemandePdf(demande, res);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
