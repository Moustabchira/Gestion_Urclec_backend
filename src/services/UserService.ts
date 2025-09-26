import prismaClient from "../utils/prismaClient";
import { User } from "../types/index";
import bcrypt from "bcryptjs";
import { createUserSchema, updateUserSchema } from "../validations/userSchema";

export interface UpdateUserData {
  nom?: string;
  prenom?: string;
  email?: string;
  username?: string;
  password?: string;
}

export default class UserService {

  public async getAllUsers(
    page = 1,
    limit = 10,
    filters?: { nom?: string; prenom?: string; email?: string; username?: string; roleId?: number }
  ): Promise<{ data: User[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters) {
      if (filters.nom) where.nom = { contains: filters.nom, mode: 'insensitive' };
      if (filters.prenom) where.prenom = { contains: filters.prenom, mode: 'insensitive' };
      if (filters.email) where.email = { contains: filters.email, mode: 'insensitive' };
      if (filters.username) where.username = { contains: filters.username, mode: 'insensitive' };
      if (filters.roleId) where.roles = { some: { roleId: filters.roleId } };
    }

    const [data, total] = await Promise.all([
      prismaClient.user.findMany({
        skip,
        take: limit,
        where,
        include: { roles: { include: { role: true } } }
      }),
      prismaClient.user.count({ where }),
    ]);

    return { data, total };
  }


  public async getUserById(id: number): Promise<User | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID utilisateur invalide");
    return prismaClient.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } }
    });
  }

  public async createUser(data: any): Promise<User> {
    const validated = createUserSchema.parse(data);
    validated.password = await bcrypt.hash(validated.password, 10);
    return prismaClient.user.create({ data: validated });
  }

  public async updateUser(userId: number, data: UpdateUserData): Promise<User> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("ID utilisateur invalide");

    const validated = updateUserSchema.parse(data);

    if (validated.password) {
      validated.password = await bcrypt.hash(validated.password, 10);
    }

    return prismaClient.user.update({
      where: { id: userId },
      data: validated,
      include: { roles: { include: { role: true } } }
    });
  }

  public async deleteUser(userId: number): Promise<User> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("ID utilisateur invalide");
    return prismaClient.user.delete({ where: { id: userId } });
  }

  public async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(roleId) || roleId <= 0)
      throw new Error("ID utilisateur ou rôle invalide");

    const existing = await prismaClient.userRole.findFirst({ where: { userId, roleId } });
    if (existing) return;

    await prismaClient.userRole.create({ data: { userId, roleId } });
  }

  public async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(roleId) || roleId <= 0)
      throw new Error("ID utilisateur ou rôle invalide");

    await prismaClient.userRole.deleteMany({ where: { userId, roleId } });
  }
}
