// validators/PointServiceValidator.ts
import { z } from "zod";

export const createPointServiceSchema = z.object({
  nom: z.string().min(1, "Le nom du point de service est requis"),
  agenceId: z.number().int().positive(),
});

export const updatePointServiceSchema = z.object({
  nom: z.string().min(1, "Le nom du point de service est requis").optional(),
  agenceId: z.number().int().positive(),
});
