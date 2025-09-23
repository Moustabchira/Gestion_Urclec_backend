import { Request, Response } from "express";
import AbsenceService from "../services/AbsenceService";
import * as status from "../utils/constantes";

const absenceService = new AbsenceService();

export default class AbsenceController {

    public async getAllAbsences(req: Request, res: Response): Promise<void> {
        try {
            const absences = await absenceService.getAllAbsences();
            res.status(status.HTTP_STATUS_OK).json(absences);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la récupération des absences", error });
        }
    }

    public async getAbsenceById(req: Request, res: Response): Promise<void> {
        try {
            const absence = await absenceService.getAbsenceById(Number(req.params.id));
            if (!absence) {
                res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Absence non trouvée" });
                return;
            }
            res.status(status.HTTP_STATUS_OK).json(absence);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la récupération de l'absence", error });
        }
    }

}