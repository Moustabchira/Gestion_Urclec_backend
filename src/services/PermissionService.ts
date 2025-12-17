import prismaClient from "../utils/prismaClient";
import { slugify } from "../utils/slugify";
import { Permission } from "../types/index";

export default class PermissionService {

      public async getPermissions(page = 1, limit = 56, filters?: { nom?: string; slug?: string }): Promise<{ data: Permission[], total: number }> {
          const skip = (page - 1) * limit;

          // Construire le where dynamiquement
          const where: any = { archive: false };
          if (filters) {
            if (filters.nom) where.nom = { contains: filters.nom, mode: 'insensitive' };
            if (filters.slug) where.slug = { contains: filters.slug, mode: 'insensitive' };
          }

          const [data, total] = await Promise.all([
            prismaClient.permission.findMany({
              skip,
              take: limit,
              where
            }),
            prismaClient.permission.count({ where })
          ]);

          return { data, total };
      }


  public async getPermissionById(id: number): Promise<Permission | null> {

    try {

      return await prismaClient.permission.findUnique({ where: { id } });

    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la permission : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }

  public async getPermissionBySlug(name: string): Promise<Permission | null> {

    const slug = slugify(name);

    try {

      return await prismaClient.permission.findUnique({ where: { slug } });

    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la permission par slug : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }

  public async updatePermission(id: number, nom: string): Promise<Permission> {

    try {

      const slug = slugify(nom);

      return await prismaClient.permission.update({
        where: { id },
        data: { nom, slug },
      });

    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la permission : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }

  public async deletePermission(id: number): Promise<Permission> {
    
    try {

      return await prismaClient.permission.update({
        where: { id },
        data: { archive: true, archivedAt: new Date() },
      });

    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la permission : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }

  public async getPermissionIdsBySlugs(slugs: string[]): Promise<number[]> {

    try {

      const permissions = await prismaClient.permission.findMany({
        where: { slug: { in: slugs }, archive: false },
        select: { id: true },
      });

      return permissions.map(p => p.id);

    } catch (error) {
      throw new Error(`Erreur lors de la récupération des IDs de permissions : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }
}
