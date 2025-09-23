import prismaClient from "../utils/prismaClient";
import { slugify } from "../utils/slugify";
import { Role } from "../types/index";


export default class RoleService {


  public async createRole(nom: string, permissionIds: number[] = []): Promise<Role> {
      try {
        const slug = slugify(nom);
        const role = await prismaClient.role.create({ data: { nom, slug } });

        if (permissionIds.length > 0) {
          await this.assignPermissionsToRole(role.id, permissionIds);
        }

        return await prismaClient.role.findUnique({
          where: { id: role.id },
          include: { rolePermissions: { include: { permission: true } } },
        }) as Role;

      } catch (error) {
        throw new Error(`Erreur lors de la création du rôle : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
      }
  }

  public async getRoles(): Promise<Role[]> {
    try {
      return await prismaClient.role.findMany({
        where: { archive: false }, // Ne récupère que les rôles non archivés
        include: {
          rolePermissions: { include: { permission: true } }
        },
      });
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des rôles : ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  }


  public async getRoleById(id: number): Promise<Role | null> {
    try {
      return await prismaClient.role.findUnique({
        where: { id },
        include: { rolePermissions: { include: { permission: true } } },
      });
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du rôle : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }

  public async getRoleBySlug(slug: string): Promise<Role | null> {
    try {
      return await prismaClient.role.findUnique({
        where: { slug },
        include: { rolePermissions: { include: { permission: true } } },
      });
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du rôle par slug : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }

  public async deleteRole(id: number): Promise<Role> {
    try {
      return await prismaClient.role.update({
        where: { id },
        data: { archive: true, archivedAt: new Date() },
      });
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du rôle : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }

  public async updateRole(
    id: number,
    data: { name?: string; description?: string; permissionIds?: number[] }
  ): Promise<Role | null> {
    try {
      const updateData: any = {};
      if (data.name) updateData.nom = data.name;
      if (data.name) updateData.slug = slugify(data.name);
      if (data.description) updateData.description = data.description;

      await prismaClient.role.update({ where: { id }, data: updateData });

      if (data.permissionIds) {
        await prismaClient.rolePermission.deleteMany({ where: { roleId: id } });
        await this.assignPermissionsToRole(id, data.permissionIds);
      }

      return await prismaClient.role.findUnique({
        where: { id },
        include: { rolePermissions: { include: { permission: true } } },
      });

    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du rôle : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }


  public async assignPermissionsToRole(roleId: number, permissionIds: number | number[]): Promise<Role> {
        const ids = Array.isArray(permissionIds) ? permissionIds : [permissionIds];

        // Récupérer les permissions déjà existantes
        const existingPermissions = await prismaClient.rolePermission.findMany({
          where: { roleId },
          select: { permissionId: true },
        });

        const existingIds = new Set(existingPermissions.map(p => p.permissionId));
        const newIds = ids.filter(id => !existingIds.has(id));

        if (newIds.length > 0) {
          const rolePermissionData = newIds.map(permissionId => ({ roleId, permissionId }));
          await prismaClient.rolePermission.createMany({ data: rolePermissionData });
        }

        return await prismaClient.role.findUnique({
          where: { id: roleId },
          include: { rolePermissions: { include: { permission: true } } },
        }) as Role;
  }


  public async removePermissionsFromRole(roleId: number, permissionIds: number | number[]): Promise<Role> {
      const ids = Array.isArray(permissionIds) ? permissionIds : [permissionIds];

      await prismaClient.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: { in: ids },
        },
      });

      return await prismaClient.role.findUnique({
        where: { id: roleId },
        include: { rolePermissions: { include: { permission: true } } },
      }) as Role;
  }


}
