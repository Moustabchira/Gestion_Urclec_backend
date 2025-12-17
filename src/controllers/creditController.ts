import { Request, Response } from "express";
import CreditService from "../services/CreditService";

const creditService = new CreditService();

export default class CreditController {
  async getAll(req: Request, res: Response) {
    const credits = await creditService.getCredits();
    res.json(credits);
  }

  async getOne(req: Request, res: Response) {
    const id = Number(req.params.id);
    const credit = await creditService.getCreditById(id);
    res.json(credit);
  }

  async create(req: Request, res: Response) {
    const credit = await creditService.createCredit(req.body);
    res.json(credit);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const credit = await creditService.updateCredit(id, req.body);
    res.json(credit);
  }

  async archive(req: Request, res: Response) {
    const id = Number(req.params.id);
    const credit = await creditService.archiveCredit(id);
    res.json({ success: true });
  }
}
