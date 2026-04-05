import { Request, Response } from "express";
import DemandeService from "../services/DemandeService";
import { createDemandeSchema, updateDemandeSchema } from "../validations/demandeSchema";
import { generateDemandePdf } from "../utils/pdfGeneretor";

const demandeService = new DemandeService();

export default class DemandeController {
  public async create(req: Request, res: Response) {
    try {
      const validated = createDemandeSchema.parse(req.body);
      const result = await demandeService.createDemande(validated);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  public async getAll(req: Request, res: Response) {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.max(Number(req.query.limit) || 10, 1);
      const filters = { type: req.query.type ? String(req.query.type) : undefined, userId: req.query.userId ? Number(req.query.userId) : undefined, status: req.query.status ? String(req.query.status) : undefined };
      const result = await demandeService.getAllDemandes(page, limit, filters);
      return res.status(200).json({ data: result.data, meta: { total: result.total, page, limit, lastPage: result.totalPages } });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await demandeService.getDemandeById(id);
      if (!data) return res.status(404).json({ message: "Introuvable" });
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const validated = updateDemandeSchema.parse(req.body);
      const updated = await demandeService.updateDemande(id, validated);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await demandeService.deleteDemande(id);
      return res.json({ message: "Supprimé avec succès" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  public async prendreDecision(req: Request, res: Response) {
    try {
      const demandeId = Number(req.params.demandeId);
      const { userId, status: decisionStatus } = req.body;
      const result = await demandeService.prendreDecision(demandeId, userId, decisionStatus);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  public async generatePdf(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const demande = await demandeService.getDemandeById(id);
      if (!demande) return res.status(404).json({ message: "Introuvable" });
      generateDemandePdf(demande, res);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
}