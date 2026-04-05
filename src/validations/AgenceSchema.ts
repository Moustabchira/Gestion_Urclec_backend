import { z } from "zod";

export const createAgenceSchema = z.object({
  nom_agence: z
    .string()
    .trim()
    .min(1, "Le nom de l'agence est obligatoire")
    .min(2, "Le nom de l'agence doit contenir au moins 2 caractères"),

  ville: z
    .string()
    .trim()
    .min(1, "La ville est obligatoire")
    .min(2, "La ville doit contenir au moins 2 caractères"),
});

export const updateAgenceSchema = z.object({
  nom_agence: z
    .string()
    .trim()
    .min(1, "Le nom de l'agence ne peut pas être vide")
    .min(2, "Le nom de l'agence doit contenir au moins 2 caractères")
    .optional(),

  ville: z
    .string()
    .trim()
    .min(1, "La ville ne peut pas être vide")
    .min(2, "La ville doit contenir au moins 2 caractères")
    .optional(),
});