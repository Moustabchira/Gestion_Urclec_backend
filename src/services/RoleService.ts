import prismaClient from "../utils/prismaClient";
import { slugify } from "../utils/slugify";
import { createRoleSchema, updateRoleSchema } from "../validations/roleSchema";
import { Role } from "../types/index";

export default class RoleService {

    public async getRoles(
      page = 1,
      limit = 10,
      filters?: { nom?: string; permissionId?: number }
    ): Promise<{ data: Role[], total: number }> {
      const skip = (page - 1) * limit;

      // Construire le where dynamiquement
      const where: any = { archive: false };
      if (filters) {
        if (filters.nom) where.nom = { contains: filters.nom, mode: 'insensitive' };
        if (filters.permissionId) where.rolePermissions = { some: { permissionId: filters.permissionId } };
      }

      const [data, total] = await Promise.all([
        prismaClient.role.findMany({
          skip,
          take: limit,
          where,
          include: { rolePermissions: { include: { permission: true } } }
        }),
        prismaClient.role.count({ where })
      ]);

      return { data, total };
    }


  public async getRoleById(id: number): Promise<Role | null> {
    return prismaClient.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } }
    });
  }


  public async getRoleBySlug(slug: string): Promise<Role | null> {
    return prismaClient.role.findUnique({
      where: { slug },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }


  public async createRole(data: any): Promise<Role> {
    const validated = createRoleSchema.parse(data);
    const slug = slugify(validated.nom);

    const role = await prismaClient.role.create({ data: { nom: validated.nom, slug } });

    if (validated.permissionIds?.length) {
      await this.assignPermissionsToRole(role.id, validated.permissionIds);
    }

    return prismaClient.role.findUnique({
      where: { id: role.id },
      include: { rolePermissions: { include: { permission: true } } }
    }) as Promise<Role>;
  }

  public async updateRole(id: number, data: any): Promise<Role | null> {
    const validated = updateRoleSchema.parse(data);

    const updateData: any = {};
    if (validated.name) {
      updateData.nom = validated.name;
      updateData.slug = slugify(validated.name);
    }

    await prismaClient.role.update({ where: { id }, data: updateData });

    if (validated.permissionIds) {
      await prismaClient.rolePermission.deleteMany({ where: { roleId: id } });
      await this.assignPermissionsToRole(id, validated.permissionIds);
    }

    return prismaClient.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } }
    });
  }

  public async deleteRole(id: number): Promise<Role> {
    return prismaClient.role.update({
      where: { id },
      data: { archive: true, archivedAt: new Date() },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }

  public async assignPermissionsToRole(roleId: number, permissionIds: number | number[]): Promise<Role> {
    const ids = Array.isArray(permissionIds) ? permissionIds : [permissionIds];

    const existing = await prismaClient.rolePermission.findMany({ where: { roleId }, select: { permissionId: true } });
    const existingIds = new Set(existing.map(p => p.permissionId));
    const newIds = ids.filter(id => !existingIds.has(id));

    if (newIds.length) {
      await prismaClient.rolePermission.createMany({
        data: newIds.map(permissionId => ({ roleId, permissionId }))
      });
    }

    return prismaClient.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    }) as Promise<Role>;
  }

  public async removePermissionsFromRole(roleId: number, permissionIds: number | number[]): Promise<Role> {
    const ids = Array.isArray(permissionIds) ? permissionIds : [permissionIds];

    await prismaClient.rolePermission.deleteMany({
      where: { roleId, permissionId: { in: ids } }
    });

    return prismaClient.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    }) as Promise<Role>;
  }
}
