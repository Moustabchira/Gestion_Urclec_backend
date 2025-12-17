import { Request, Response } from "express";
import UserService from "../services/UserService";
import * as status from "../utils/constantes";

const userService = new UserService();

export default class UserController {

  private parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  // GET /users
  public async getAllUsers(req: any, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters = {
      nom: req.query.nom as string,
      prenom: req.query.prenom as string,
      email: req.query.email as string,
      username: req.query.username as string,
      roleId: req.query.roleId ? parseInt(req.query.roleId as string) : undefined,
    };

    try {
      const result = await userService.getAllUsers(page, limit, filters, req.user);
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

  // GET /users/:id
  public async getUserById(req: Request, res: Response) {
    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID utilisateur invalide" });

    try {
      const user = await userService.getUserById(id);
      if (!user) return res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Utilisateur non trouvé" });
      res.status(status.HTTP_STATUS_OK).json(user);
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  // GET /users/agence/:agenceId
  public async getUsersByAgence(req: any, res: Response) {
    const agenceId = this.parseId(req.params.agenceId);
    if (!agenceId) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID agence invalide" });

    try {
      const users = await userService.getUsersByAgence(agenceId, req.user);
      res.status(status.HTTP_STATUS_OK).json(users);
    } catch (error) {
      res.status(status.HTTP_STATUS_FORBIDDEN).json({ message: error instanceof Error ? error.message : "Accès refusé" });
    }
  }

  // POST /users
  public async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      const { password, ...userWithoutPassword } = user as any; // retirer le mot de passe
      res.status(status.HTTP_STATUS_OK).json({
        message: "Utilisateur créé avec succès",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error.message || "Erreur inconnue" });
    }
  }

  // PUT /users/:id
  public async updateUser(req: Request, res: Response) {
    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID utilisateur invalide" });

    try {
      const updatedUser = await userService.updateUser(id, req.body);
      const { password, ...userWithoutPassword } = updatedUser as any;
      res.status(status.HTTP_STATUS_OK).json({
        message: "Utilisateur mis à jour avec succès",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: error.message || "Erreur inconnue" });
    }
  }

  // DELETE /users/:id
  public async deleteUser(req: Request, res: Response) {
    const id = this.parseId(req.params.id);
    if (!id) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID utilisateur invalide" });

    try {
      const deletedUser = await userService.deleteUser(id);
      res.status(status.HTTP_STATUS_OK).json({
        message: "Utilisateur supprimé avec succès",
        user: deletedUser,
      });
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  // POST /users/:userId/roles/:roleId
  public async assignRoleToUser(req: Request, res: Response) {
    const userId = this.parseId(req.params.userId);
    const roleId = this.parseId(req.params.roleId);
    if (!userId || !roleId) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID utilisateur ou rôle invalide" });

    try {
      await userService.assignRoleToUser(userId, roleId);
      res.status(status.HTTP_STATUS_OK).json({ message: "Rôle attribué avec succès" });
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  // DELETE /users/:userId/roles/:roleId
  public async removeRoleFromUser(req: Request, res: Response) {
    const userId = this.parseId(req.params.userId);
    const roleId = this.parseId(req.params.roleId);
    if (!userId || !roleId) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID utilisateur ou rôle invalide" });

    try {
      await userService.removeRoleFromUser(userId, roleId);
      res.status(status.HTTP_STATUS_OK).json({ message: "Rôle retiré avec succès" });
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }

  // POST /users/:userId/chef/:chefId
  public async assignChefToUser(req: Request, res: Response) {
    const userId = this.parseId(req.params.userId);
    const chefId = this.parseId(req.params.chefId);
    if (!userId || !chefId) return res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID utilisateur ou chef invalide" });

    try {
      await userService.assignChefToUser(userId, chefId);
      res.status(status.HTTP_STATUS_OK).json({ message: "Chef attribué avec succès" });
    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: error instanceof Error ? error.message : "Erreur inconnue" });
    }
  }
}
