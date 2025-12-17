import { z } from "zod";

export const createAgenceSchema = z.object({
  nom_agence: z.string().min(2, "Le nom de l'agence doit contenir au moins 2 caractères"),
  ville: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
});

export const updateAgenceSchema = z.object({
  nom_agence: z.string().min(2).optional(),
  ville: z.string().min(2).optional(),
});
