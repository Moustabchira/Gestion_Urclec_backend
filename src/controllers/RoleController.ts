import { Request, Response } from "express";
import RoleService from "../services/RoleService";
import * as status from "../utils/constantes";

const roleService = new RoleService();

export default class RoleController {

  private parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

        public async getRoles(req: Request, res: Response) {
            
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const filters = {
                nom: req.query.nom as string,
                permissionId: req.query.permissionId ? parseInt(req.query.permissionId as string) : undefined,
            };

            try {
                const result = await roleService.getRoles(page, limit, filters);
                res.status(status.HTTP_STATUS_OK).json({
                data: result.data,
                meta: {
                    total: result.total,
                    page,
                    lastPage: Math.ceil(result.total / limit)
                }
                });
            } catch (error) {
                res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
            }
        }


  public async getRoleById(req: Request, res: Response) {
    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });

    try {
      const role = await roleService.getRoleById(id);
      if (!role) return res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Rôle non trouvé" });
      res.status(status.HTTP_STATUS_OK).json(role);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async createRole(req: Request, res: Response) {
    try {
      const role = await roleService.createRole(req.body);
      res.status(status.HTTP_STATUS_CREATED).json(role);
    } catch (error) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async updateRole(req: Request, res: Response) {
    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });

    try {
      const updatedRole = await roleService.updateRole(id, req.body);
      res.status(status.HTTP_STATUS_OK).json(updatedRole);
    } catch (error) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async deleteRole(req: Request, res: Response) {
    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });

    try {
      const deletedRole = await roleService.deleteRole(id);
      res.status(status.HTTP_STATUS_OK).json(deletedRole);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async assignPermissionToRole(req: Request, res: Response) {
    const roleId = this.parseId(req.params.roleId);
    if (!roleId) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });

    try {
      const updatedRole = await roleService.assignPermissionsToRole(roleId, req.body.permissionIds);
      res.status(status.HTTP_STATUS_OK).json(updatedRole);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  public async removePermissionFromRole(req: Request, res: Response) {
    const roleId = this.parseId(req.params.roleId);
    if (!roleId) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });

    try {
      const updatedRole = await roleService.removePermissionsFromRole(roleId, req.body.permissionIds);
      res.status(status.HTTP_STATUS_OK).json(updatedRole);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }
}
