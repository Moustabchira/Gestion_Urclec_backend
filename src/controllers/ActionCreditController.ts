import { Request, Response } from "express";
import ActionCreditService from "../services/ActionCreditService";

const actionService = new ActionCreditService();

export default class ActionCreditController {

  // 🔹 Historique global des actions (paginated)
  async getAll(req: Request, res: Response) {
    try {
      let page = Number(req.query.page) || 1;
      let limit = Number(req.query.limit) || 10;

      const result = await actionService.getAllActionsPaginated(page, limit);

      res.status(200).json({
        data: result.data,
        meta: result.meta,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Actions d’un crédit (paginated)
  async getByCredit(req: Request, res: Response) {
    try {
      const creditId = Number(req.params.creditId);
      if (!creditId) throw new Error("ID du crédit manquant");

      let page = Number(req.query.page) || 1;
      let limit = Number(req.query.limit) || 10;

      const result = await actionService.getActionsByCreditPaginated(creditId, page, limit);

      res.status(200).json({
        data: result.data,
        meta: result.meta,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Création d’une action pour un crédit
  async create(req: Request, res: Response) {
    try {
      const creditId = Number(req.params.creditId);
      if (!creditId) throw new Error("ID du crédit manquant");

      const action = await actionService.createAction({
        ...req.body,
        creditId,
      });

      res.status(201).json(action);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Mise à jour d’une action
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const action = await actionService.updateAction(id, req.body);
      res.status(200).json(action);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🔹 Archivage d’une action
  async archive(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await actionService.archiveAction(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Suppression définitive d’une action
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await actionService.deleteAction(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}