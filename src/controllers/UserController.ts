import { Request, Response } from "express";
import UserService from "../services/UserService";
import * as status from '../utils/constantes'


const userService = new UserService();

export default class UserController {

    public async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await userService.getAllUsers();
            res.status(status.HTTP_STATUS_OK).json(users);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la récupération des utilisateurs' });
        }
    }

    public async getUserById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        try {
            const user = await userService.getUserById(id);
            if (user) {
                res.status(status.HTTP_STATUS_OK).json(user);
            } else {
                res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: 'Utilisateur non trouvé' });
            }
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
        }
    }

    public async updateUser(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const data = req.body;
        try {
            const updatedUser = await userService.updateUser(id, data);
            res.status(status.HTTP_STATUS_OK).json(updatedUser);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        try {
            const deletedUser = await userService.deleteUser(id);
            res.status(status.HTTP_STATUS_OK).json(deletedUser);
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
        }
    }

    public async assignRoleToUser(req: Request, res: Response): Promise<void> {

        const userId = parseInt(req.params.userId);
        const roleId = parseInt(req.params.roleId);

        try {
            await userService.assignRoleToUser(userId, roleId);
            res.status(status.HTTP_STATUS_OK).json({ message: 'Rôle attribué à l\'utilisateur avec succès' });
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de l\'attribution du rôle à l\'utilisateur' });
        }
    }

    public async removeRoleFromUser(req: Request, res: Response): Promise<void> {

        const userId = parseInt(req.params.userId);
        const roleId = parseInt(req.params.roleId);
        
        try {
            await userService.removeRoleFromUser(userId, roleId);
            res.status(status.HTTP_STATUS_OK).json({ message: 'Rôle retiré de l\'utilisateur avec succès' });
        } catch (error) {
            res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors du retrait du rôle de l\'utilisateur' });
        }
    }
}