// services/RoleService.ts
import prismaClient from "../utils/prismaClient";
import { slugify } from "../utils/slugify";
import { createRoleSchema, updateRoleSchema } from "../validations/roleSchema";
import { Role } from "../types/index";

export default class RoleService {
  
  // Création d’un rôle
  public async createRole(data: any): Promise<Role> {
    const validated = createRoleSchema.parse(data);
    const slug = slugify(validated.nom);

    // Création du rôle
    const role = await prismaClient.role.create({
      data: { nom: validated.nom, slug },
    });

    // Assignation des permissions si présentes
    if (validated.permissionIds.length > 0) {
      await this.assignPermissionsToRole(role.id, validated.permissionIds);
    }

    // Retour du rôle avec permissions incluses
    return prismaClient.role.findUnique({
      where: { id: role.id },
      include: { rolePermissions: { include: { permission: true } } },
    }) as Promise<Role>;
  }

  // Mise à jour d’un rôle
  public async updateRole(id: number, data: any): Promise<Role | null> {
    const validated = updateRoleSchema.parse(data);

    // Mise à jour du nom et slug si présent
    const updateData: any = {};
    if (validated.nom) {
      updateData.nom = validated.nom;
      updateData.slug = slugify(validated.nom);
    }
    await prismaClient.role.update({ where: { id }, data: updateData });

    // Gestion des permissions
    if (validated.permissionIds) {
      // Supprime toutes les permissions existantes
      await prismaClient.rolePermission.deleteMany({ where: { roleId: id } });

      // Réassigne les permissions sélectionnées
      if (validated.permissionIds.length > 0) {
        await this.assignPermissionsToRole(id, validated.permissionIds);
      }
    }

    // Retour du rôle avec permissions incluses
    return prismaClient.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }

  // Assignation de permissions
  public async assignPermissionsToRole(roleId: number, permissionIds: number | number[]): Promise<Role> {
    const ids = Array.isArray(permissionIds) ? permissionIds : [permissionIds];

    // Filtrer les permissions déjà assignées
    const existing = await prismaClient.rolePermission.findMany({
      where: { roleId },
      select: { permissionId: true },
    });
    const existingIds = new Set(existing.map(p => p.permissionId));
    const newIds = ids.filter(id => !existingIds.has(id));

    if (newIds.length > 0) {
      await prismaClient.rolePermission.createMany({
        data: newIds.map(permissionId => ({ roleId, permissionId })),
      });
    }

    return prismaClient.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    }) as Promise<Role>;
  }

  public async getRoles(page: number, limit: number, filters: any): Promise<{ data: Role[]; total: number }> {
    const where: any = {};

    if (filters.nom) {
      where.nom = { contains: filters.nom, mode: "insensitive" };
    }
    if (filters.permissionId) {
      where.rolePermissions = { some: { permissionId: filters.permissionId } };
    }

    const [data, total] = await Promise.all([
      prismaClient.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { rolePermissions: { include: { permission: true } } },
        orderBy: { id: "asc" },
      }),
      prismaClient.role.count({ where }),
    ]);

    return { data, total };
  }

  public async getRoleById(id: number): Promise<Role | null> {
    return prismaClient.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }

  public async getRoleBySlug(slug: string): Promise<Role | null> {
    return prismaClient.role.findUnique({
      where: { slug },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }

  public async deleteRole(id: number): Promise<void> {
    await prismaClient.rolePermission.deleteMany({ where: { roleId: id } });
    await prismaClient.role.delete({ where: { id } });
  }

  public async removePermissionsFromRole(roleId: number, permissionIds: number | number[]): Promise<Role> {
    const ids = Array.isArray(permissionIds) ? permissionIds : [permissionIds];

    await prismaClient.rolePermission.deleteMany({
      where: { roleId, permissionId: { in: ids } },
    });

    return prismaClient.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    }) as Promise<Role>;
  }
}