import prismaClient from "../utils/prismaClient";
import { User } from "../types/index";
import bcrypt from 'bcryptjs';

interface UpdateUserData {
    name?: string;
    prenom?: string;
    email?: string;
    username?: string;
    password?: string;
}

export default class UserService {

    public async getAllUsers(): Promise<User[]> {

       try {

            const users = await prismaClient.user.findMany({
                include: {
                    roles: {
                        include: {
                            role: true
                        }
                    }
                }
            });
            return users;

       } catch (error) {
            throw new Error('Erreur lors de la récupération des utilisateurs');
       }
    }   


    public async getUserById(id: number): Promise<User | null> {

        try {

            const user = await prismaClient.user.findUnique({
                where: { id },
                include: {
                    roles: {
                        include: {
                            role: true
                        }
                    }
                }
            });
            return user;

        } catch (error) {
            throw new Error('Erreur lors de la récupération de l\'utilisateur');
        }
        
    }

    public async updateUser(userId: number, data: UpdateUserData): Promise<User> {
        try {

            const userData: any = { ...data };
            const { password } = userData;

            if (password) {
                userData.password = await bcrypt.hash(password, 10);
            }

            const updatedUser = await prismaClient.user.update({
                where: { id: userId },
                data: userData,
            });
            
            return updatedUser;
        } catch (error) {
            throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
        }
    }

    public async deleteUser(id: number): Promise<User> {
        try {
            const deletedUser = await prismaClient.user.delete({
                where: { id }
            });
            return deletedUser;
        } catch (error) {
            throw new Error('Erreur lors de la suppression de l\'utilisateur');
        }
    }

    public async assignRoleToUser(userId: number, roleId: number): Promise<void> {
        try {
            await prismaClient.userRole.create({
                data: {
                    userId,
                    roleId
                }
            });
        } catch (error) {
            throw new Error('Erreur lors de l\'attribution du rôle à l\'utilisateur');
        }
    }

    public async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
        try {
            await prismaClient.userRole.deleteMany({
                where: {
                    userId,
                    roleId
                }
            });
        } catch (error) {
            throw new Error('Erreur lors de la suppression du rôle de l\'utilisateur');
        }
    }
    
    
}