import { z } from "zod";

export const createEvenementSchema = z.object({
  titre: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(5, "La description doit contenir au moins 5 caractères"),
  userId: z.number().int().positive(),
  archive: z.boolean().optional(),
});

export const updateEvenementSchema = z.object({
  titre: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  archive: z.boolean().optional(),
});
