import { Request, Response } from "express";
import CreditService from "../services/CreditService";

const creditService = new CreditService();

export default class CreditController {

  private parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Récupérer tous les crédits (paginés)
  // ------------------------------------------------------------------------------------
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await creditService.getCredits(page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Crédit par ID
  // ------------------------------------------------------------------------------------
  public async getOne(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(400).json({ message: "ID de crédit invalide" });
      return;
    }

    try {
      const credit = await creditService.getCreditById(id);
      if (!credit) {
        res.status(404).json({ message: "Crédit introuvable" });
        return;
      }
      res.status(200).json(credit);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Créer un crédit
  // ------------------------------------------------------------------------------------
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const credit = await creditService.createCredit(req.body);
      res.status(201).json(credit);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Mettre à jour un crédit
  // ------------------------------------------------------------------------------------
  public async update(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(400).json({ message: "ID de crédit invalide" });
      return;
    }

    try {
      const credit = await creditService.updateCredit(id, req.body);
      res.status(200).json(credit);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Archiver un crédit
  // ------------------------------------------------------------------------------------
  public async archive(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(400).json({ message: "ID de crédit invalide" });
      return;
    }

    try {
      await creditService.archiveCredit(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ------------------------------------------------------------------------------------
  // ⭐ Crédits impayés paginés (TOUS)
  // ------------------------------------------------------------------------------------
  public async getImpayes(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await creditService.getCreditsImpayes(page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ------------------------------------------------------------------------------------
  // ⭐ Crédits impayés par agent (paginés)
  // ------------------------------------------------------------------------------------
  public async getImpayesByAgent(req: Request, res: Response): Promise<void> {
    const agentId = this.parseId(req.params.agentId);
    if (!agentId) {
      res.status(400).json({ message: "ID d'agent invalide" });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    try {
      const result = await creditService.getCreditsImpayesByAgent(agentId, page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}