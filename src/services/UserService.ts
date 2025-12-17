import prismaClient from "../utils/prismaClient";
import { User } from "../types/index";
import bcrypt from "bcryptjs";
import { createUserSchema, updateUserSchema } from "../validations/userSchema";
import { generateCodeIdentifiant } from "../utils/generateCodeIdentifiant";

export default class UserService {

  // Récupérer tous les utilisateurs avec pagination et filtres
    public async getAllUsers(
    page = 1,
    limit = 10,
    filters?: { nom?: string; prenom?: string; email?: string; username?: string; roleId?: number },
    currentUser?: any // <-- nouvel argument
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

    // Filtrage par agence si l'utilisateur n'est pas admin
    if (currentUser && !currentUser.roles.includes("ADMIN")) {
    where.agenceId = currentUser.agenceId;
    }

    const [data, total] = await Promise.all([
    prismaClient.user.findMany({
      skip,
      take: limit,
      where,
      include: {
        roles: { include: { role: true } },
        agence: true,
        poste: true,
        chef: true,
      },
    }),
    prismaClient.user.count({ where }),
    ]);

    return { data, total };
  }

  // Récupérer un utilisateur par ID
  public async getUserById(id: number): Promise<User | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID utilisateur invalide");

    return prismaClient.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        agence: true,
        poste: true,
        chef: true,
      },
    });
  }

  // Récupérer tous les utilisateurs d'une agence
  public async getUsersByAgence(agenceId: number, currentUser?: any): Promise<User[]> {
    if (!Number.isInteger(agenceId) || agenceId <= 0) throw new Error("ID agence invalide");

    // Si non-admin, ne peut voir que sa propre agence
    if (currentUser && !currentUser.roles.includes("ADMIN") && currentUser.agenceId !== agenceId) {
      throw new Error("Accès refusé : agence différente");
    }

    return prismaClient.user.findMany({
      where: { agenceId },
      include: { roles: { include: { role: true } }, poste: true, chef: true },
    });
  }


  // Créer un nouvel utilisateur
  public async createUser(data: any): Promise<User> {
    const validated = createUserSchema.parse({
      ...data,
      code_identifiant: generateCodeIdentifiant(),
    });

    validated.password = await bcrypt.hash(validated.password, 10);
    if (validated.chefId === undefined) validated.chefId = null;

    const { roles, ...userData } = validated;

    return prismaClient.user.create({
      data: {
        ...userData,
        posteId: validated.posteId,
        roles: roles && roles.length > 0
          ? { create: roles.map((roleId: number) => ({ roleId })) }
          : undefined,
      },
      include: {
        roles: { include: { role: true } },
        agence: true,
        poste: true,
        chef: true,
      },
    });
  }

  // Mettre à jour un utilisateur
  public async updateUser(userId: number, data: any): Promise<User> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("ID utilisateur invalide");

    const validated = updateUserSchema.parse(data);

    if (validated.password) {
      validated.password = await bcrypt.hash(validated.password, 10);
    }

    const { roles, posteId, ...userData } = validated;

    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: {
        ...userData,
        ...(posteId !== undefined ? { posteId } : {}),
      },
      include: { roles: { include: { role: true } }, agence: true, poste: true, chef: true },
    });

    if (roles) {
      // Supprimer les anciens rôles uniquement si roles fourni
      await prismaClient.userRole.deleteMany({ where: { userId } });

      if (roles.length > 0) {
        await prismaClient.userRole.createMany({
          data: roles.map((roleId: number) => ({ userId, roleId })),
        });
      }
    }

    return updatedUser;
  }

  // Supprimer un utilisateur avec toutes ses relations
  public async deleteUser(userId: number): Promise<User> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("ID utilisateur invalide");
    }

    // Vérifier si l'utilisateur existe
    const user = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Utilisateur non trouvé");

    // --- Étape 1 : Mettre à jour les subordonnés pour casser le lien chef ---
    await prismaClient.user.updateMany({
      where: { chefId: userId },
      data: { chefId: null },
    });

    // --- Étape 2 : Supprimer ou archiver les décisions ---
    await prismaClient.decision.deleteMany({ where: { userId } });

    // --- Étape 3 : Supprimer les demandes et leurs sous-éléments ---
    const demandes = await prismaClient.demande.findMany({ where: { userId } });
    for (const demande of demandes) {
      await prismaClient.conge.deleteMany({ where: { demandeId: demande.id } });
      await prismaClient.absence.deleteMany({ where: { demandeId: demande.id } });
      await prismaClient.demandePermission.deleteMany({ where: { demandeId: demande.id } });
      await prismaClient.demande.delete({ where: { id: demande.id } });
    }

    // --- Étape 4 : Supprimer actions, équipements, événements ---
    await prismaClient.action.deleteMany({ where: { userId } });
    await prismaClient.evenement.deleteMany({ where: { userId } });

    // --- Étape 5 : Supprimer les rôles ---
    await prismaClient.userRole.deleteMany({ where: { userId } });

    // --- Étape 6 : Supprimer l'utilisateur ---
    return prismaClient.user.delete({ where: { id: userId } });
  }



  // Assigner un rôle à un utilisateur
  public async assignRoleToUser(userId: number | string, roleId: number | string): Promise<void> {
    const parsedUserId = Number(userId);
    const parsedRoleId = Number(roleId);

    // if (!Number.isInteger(parsedUserId) || parsedUserId <= 0 || !Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
    //   throw new Error("ID utilisateur ou rôle invalide");
    // }

    const existing = await prismaClient.userRole.findFirst({
      where: { userId: parsedUserId, roleId: parsedRoleId },
    });

    if (!existing) {
      await prismaClient.userRole.create({
        data: { userId: parsedUserId, roleId: parsedRoleId },
      });
    }
  }


  // Supprimer un rôle d'un utilisateur
  public async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(roleId) || roleId <= 0)
      throw new Error("ID utilisateur ou rôle invalide");

    await prismaClient.userRole.deleteMany({ where: { userId, roleId } });
  }

  // Assigner un chef à un utilisateur
  public async assignChefToUser(userId: number | string, chefId: number | string): Promise<void> {
    const parsedUserId = Number(userId);
    const parsedChefId = Number(chefId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0 || !Number.isInteger(parsedChefId) || parsedChefId <= 0) {
      throw new Error("ID utilisateur ou chef invalide");
    }

    await prismaClient.user.update({
      where: { id: parsedUserId },
      data: { chefId: parsedChefId },
    });
  }

}
