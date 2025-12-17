import { Request, Response } from "express";
import AffectationService from "../services/AffectationService";
import { generateHistoriquePDF } from "../utils/pdfHistorique";

const service = new AffectationService();

export default class AffectationController {

  async affecter(req: Request, res: Response) {
    try {
      const affectation = await service.affecterEquipement(req.body);
      res.status(201).json(affectation);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async changerStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await service.changerStatusAffectation(id, status);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async retirer(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await service.retirerAffectation(id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async enCours(req: Request, res: Response) {
    try {
      const list = await service.getAffectationsEnCours();
      res.json(list);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async historique(req: Request, res: Response) {
    try {
      const list = await service.getHistorique();
      res.json(list);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async historiquePDF(req: Request, res: Response) {
    try {
      const list = await service.getHistorique();
      generateHistoriquePDF(list, res);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
