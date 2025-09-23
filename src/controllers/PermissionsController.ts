import { Request, Response } from "express";
import PermissionsService from "../services/PermissionsService";
import * as status from "../utils/constantes";


const permissionsService = new PermissionsService();

export default class PermissionsController {

    public async getAllPermissions(req: Request, res: Response): Promise<void> {
        try {
            const permissions = await permissionsService.getAllPermissions();
            res.status(status.HTTP_STATUS_OK).json(permissions);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la récupération des permissions' });
        }
    }

    public async getPermissionById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        try {
            const permission = await permissionsService.getPermissionById(id);
            if (permission) {
                res.status(status.HTTP_STATUS_OK).json(permission);
            } else {
                res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: 'Permission non trouvée' });
            }
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la récupération de la permission' });
        }
    }

}   