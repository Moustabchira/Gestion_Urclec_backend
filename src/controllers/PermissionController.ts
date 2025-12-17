import { Request, Response } from "express";
import PermissionService from "../services/PermissionService";
import * as status from '../utils/constantes'

const permissionService = new PermissionService();

export default class PermissionController {
    
    public async getPermissions(req: Request, res: Response): Promise<void> {
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 56;

        const filters = {
            nom: req.query.nom as string,
            slug: req.query.slug as string
        };

        try {
            const result = await permissionService.getPermissions(page, limit, filters);
            res.status(status.HTTP_STATUS_OK).json({
            data: result.data,
            meta: {
                total: result.total,
                page,
                lastPage: Math.ceil(result.total / limit)
            }
            });
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la récupération des permissions' });
        }
    }


    public async getPermissionById(req: Request, res: Response): Promise<void> {

        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: 'ID de permission invalide' });
            return;
        }

        try {
            const permission = await permissionService.getPermissionById(id);
            if (permission) {
                res.status(status.HTTP_STATUS_OK).json(permission);
            } else {
                res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: 'Permission non trouvée' });
            }
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la récupération de la permission' });
        }
    }

    public async updatePermission(req: Request, res: Response): Promise<void> {

        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: 'ID de permission invalide' });
            return;
        }

        const { name } = req.body;

        try {
            const updatedPermission = await permissionService.updatePermission(id, name);
            res.status(status.HTTP_STATUS_OK).json(updatedPermission);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la mise à jour de la permission' });
        }
    }

    public async deletePermission(req: Request, res: Response): Promise<void> {

        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: 'ID de permission invalide' });
            return;
        }

        try {
            await permissionService.deletePermission(id);
            res.status(status.HTTP_STATUS_OK).json({ message: 'Permission supprimée avec succès' });
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la suppression de la permission' });
        }
    }
}