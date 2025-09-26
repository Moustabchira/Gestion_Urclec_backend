import { Request, Response } from "express";
import PermissionsService from "../services/PermissionsService";
import * as status from "../utils/constantes";

const permissionsService = new PermissionsService();

export default class PermissionsController {

  private parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  public async getAllPermissions(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const filters = {
        name: req.query.name ? String(req.query.name) : undefined,
        slug: req.query.slug ? String(req.query.slug) : undefined,
      };

      const result = await permissionsService.getAllPermissions(page, limit, filters);
      res.status(status.HTTP_STATUS_OK).json(result);

    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR)
         .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async getPermissionsById(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID de permission invalide" });
      return;
    }

    try {
      const permission = await permissionsService.getPermissionById(id);
      if (!permission) {
        res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Permission non trouvée" });
        return;
      }
      res.status(status.HTTP_STATUS_OK).json(permission);

    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR)
         .json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }
}
