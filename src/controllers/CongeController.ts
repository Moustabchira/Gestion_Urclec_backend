import { Request, Response } from "express";
import CongeService from "../services/CongeService";
import * as status from "../utils/constantes";



const congeService = new CongeService();

export default class CongeController {

    public async getAll(req: Request, res: Response): Promise<void> {

        try {
        const conges = await congeService.getAllConges();
        res.json(conges);
        } catch (error) {
        res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la récupération", error });
        }

    }

    public async getOne(req: Request, res: Response): Promise<void> {

        try {
        const conge = await congeService.getCongeById(Number(req.params.id));
        if (!conge) {
            res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Congé non trouvé" });
            return;
        }
        res.json(conge);
        } catch (error) {
        res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la récupération", error });
        }

    }
}

