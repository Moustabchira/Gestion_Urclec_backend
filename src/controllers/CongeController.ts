import { Request, Response } from "express";
import CongeService from "../services/CongeService";
import * as status from "../utils/constantes";

const congeService = new CongeService();

export default class CongeController {

    private parseId(value: string): number | null {
        const id = Number(value);
        return Number.isInteger(id) && id > 0 ? id : null;
    }

    public async getAll(req: Request, res: Response): Promise<void> {
        
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const filters = {
            nbJoursMin: req.query.nbJoursMin ? Number(req.query.nbJoursMin) : undefined,
            nbJoursMax: req.query.nbJoursMax ? Number(req.query.nbJoursMax) : undefined,
            userId: req.query.userId ? Number(req.query.userId) : undefined,
            };

            const result = await congeService.getAllConges(page, limit, filters);
            res.status(status.HTTP_STATUS_OK).json(result);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR)
            .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
        }
    }


    public async getOne(req: Request, res: Response): Promise<void> {

        const id = this.parseId(req.params.id);
        if (!id) {
        res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID de congé invalide" });
        return;
        }

        try {
        const conge = await congeService.getCongeById(id);
        if (!conge) {
            res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Congé non trouvé" });
            return;
        }
        res.status(status.HTTP_STATUS_OK).json(conge);
        } catch (error) {
        res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR)
            .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
        }
    }
}
