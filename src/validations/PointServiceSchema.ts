// validators/PointServiceValidator.ts
import { z } from "zod";

// Schéma pour la création d'un point de service
export const createPointServiceSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(1, "Le nom du point de service est obligatoire")
    .min(2, "Le nom du point de service doit contenir au moins 2 caractères"),

  agenceId: z
    .union([z.string(), z.number()]) // pour accepter string ou number
    .refine((val) => {
      const num = Number(val);
      return Number.isInteger(num) && num > 0;
    }, {
      message: "L'ID de l'agence est invalide"
    }),
});

// Schéma pour la mise à jour d'un point de service
export const updatePointServiceSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(1, "Le nom du point de service ne peut pas être vide")
    .min(2, "Le nom du point de service doit contenir au moins 2 caractères")
    .optional(), // facultatif pour la mise à jour

  agenceId: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const num = Number(val);
      return Number.isInteger(num) && num > 0;
    }, {
      message: "L'ID de l'agence est invalide"
    })
    .optional(), // facultatif pour la mise à jour
});