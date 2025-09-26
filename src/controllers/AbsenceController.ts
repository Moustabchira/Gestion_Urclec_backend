import { Request, Response } from "express";
import AbsenceService from "../services/AbsenceService";
import * as status from "../utils/constantes";

const absenceService = new AbsenceService();

export default class AbsenceController {

  private parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  public async getAllAbsences(req: Request, res: Response): Promise<void> {
    try {
      // Pagination
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      // Filtrage
      const filters = {
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        justification: req.query.justification ? String(req.query.justification) : undefined,
        dateDebut: req.query.dateDebut ? String(req.query.dateDebut) : undefined,
        dateFin: req.query.dateFin ? String(req.query.dateFin) : undefined,
      };

      const result = await absenceService.getAllAbsences(page, limit, filters);
      res.status(status.HTTP_STATUS_OK).json(result);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR)
         .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async getAbsenceById(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID d'absence invalide" });
      return;
    }

    try {
      const absence = await absenceService.getAbsenceById(id);
      if (!absence) {
        res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Absence non trouvée" });
        return;
      }
      res.status(status.HTTP_STATUS_OK).json(absence);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR)
         .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }
}
