import { z } from "zod";

export const createRoleSchema = z.object({
  nom: z.string().min(2, "Le nom du rôle doit contenir au moins 2 caractères"),
  permissionIds: z.array(z.number().int().positive()).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  permissionIds: z.array(z.number().int().positive()).optional(),
});
