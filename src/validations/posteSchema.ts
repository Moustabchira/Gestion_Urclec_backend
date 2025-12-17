import { z } from "zod";

// 🔹 Validation pour la création d'un poste
export const createPosteSchema = z.object({
  nom: z.string()
    .min(2, "Le nom du poste doit contenir au moins 2 caractères")
    .max(50, "Le nom du poste doit contenir au maximum 50 caractères"),
});

// 🔹 Validation pour la mise à jour d'un poste
export const updatePosteSchema = z.object({
  nom: z.string()
    .min(2, "Le nom du poste doit contenir au moins 2 caractères")
    .max(50, "Le nom du poste doit contenir au maximum 50 caractères")
    .optional(),
});
