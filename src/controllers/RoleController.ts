import { Request, Response } from "express";
import RoleService from "../services/RoleService";
import * as status from '../utils/constantes';

const roleService = new RoleService();

export default class RoleController {

    public async getRoles(req: Request, res: Response): Promise<void> {
        try {
            const roles = await roleService.getRoles();
            res.status(status.HTTP_STATUS_OK).json(roles);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la récupération des rôles' });
        }
    }


    public async createRole(req: Request, res: Response): Promise<void> {
        const { nom, permissionIds } = req.body; // possibilité d’envoyer permissions à la création
        try {
            const newRole = await roleService.createRole(nom, permissionIds || []);
            res.status(status.HTTP_STATUS_CREATED).json(newRole);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la création du rôle' });
        }
    }

    public async getRoleById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        try {
            const role = await roleService.getRoleById(id);
            if (role) {
                res.status(status.HTTP_STATUS_OK).json(role);
            } else {
                res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: 'Rôle non trouvé' });
            }
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la récupération du rôle' });
        }
    }

    public async updateRole(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const { name, description, permissionIds } = req.body;
        try {
            const updatedRole = await roleService.updateRole(id, { name, description, permissionIds });
            res.status(status.HTTP_STATUS_OK).json(updatedRole);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la mise à jour du rôle' });
        }
    }

    public async deleteRole(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        try {
            const deletedRole = await roleService.deleteRole(id);
            res.status(status.HTTP_STATUS_OK).json(deletedRole);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la suppression d\'un rôle' });
        }
    }

    public async assignPermissionToRole(req: Request, res: Response): Promise<void> {
        const roleId = parseInt(req.params.roleId);
        const { permissionIds } = req.body; // accepte un ID ou un tableau
        try {
            const updatedRole = await roleService.assignPermissionsToRole(roleId, permissionIds);
            res.status(status.HTTP_STATUS_OK).json(updatedRole);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de l\'attribution des permissions au rôle' });
        }
    }

    public async removePermissionFromRole(req: Request, res: Response): Promise<void> {
        const roleId = parseInt(req.params.roleId);
        const { permissionIds } = req.body; // accepte un ID ou un tableau
        try {
            const updatedRole = await roleService.removePermissionsFromRole(roleId, permissionIds);
            res.status(status.HTTP_STATUS_OK).json(updatedRole);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la suppression des permissions du rôle' });
        }
    }
}
