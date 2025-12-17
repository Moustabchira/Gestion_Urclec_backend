import prismaClient from "../utils/prismaClient";
import { Permission } from "../types/index";

interface GetAllPermissionsFilters {
  name?: string;
  slug?: string;
}

export default class PermissionsService {

  public async getAllPermissions(
    page = 1,
    limit = 10,
    filters?: GetAllPermissionsFilters
  ): Promise<{ data: Permission[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters) {
      if (filters.name) where.name = { contains: filters.name, mode: 'insensitive' };
      if (filters.slug) where.slug = { contains: filters.slug, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prismaClient.permission.findMany({
        skip,
        take: limit,
        where,
      }),
      prismaClient.permission.count({ where }),
    ]);

    return { data, total };
  }

  public async getPermissionById(id: number): Promise<Permission | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID de permission invalide");

    return prismaClient.permission.findUnique({
      where: { id },
    });
  }
}
