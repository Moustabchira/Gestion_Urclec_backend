import { Request, Response } from "express";
import ActionCreditService from "../services/ActionCreditService";

const actionService = new ActionCreditService();

export default class ActionCreditController {
  async getByCredit(req: Request, res: Response) {
    const creditId = Number(req.params.creditId);
    const actions = await actionService.getActionsByCredit(creditId);
    res.json(actions);
  }

  async create(req: Request, res: Response) {
    const action = await actionService.createAction(req.body);
    res.json(action);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const action = await actionService.updateAction(id, req.body);
    res.json(action);
  }

  async archive(req: Request, res: Response) {
    const id = Number(req.params.id);
    const action = await actionService.archiveAction(id);
    res.json({ success: true });
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await actionService.deleteAction(id);
    res.json({ success: true });
  }
}
