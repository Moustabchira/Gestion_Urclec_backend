import { z } from "zod";

// ✅ Fonction de transformation et validation des dates
const dateSchema = z.preprocess(
  (val) => {
    if (typeof val === "string" || val instanceof Date) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
    return undefined;
  },
  z
    .date()
    .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
      message: "Date invalide",
    })
);

// 🔹 Création
export const createEvenementSchema = z.object({
  titre: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(5, "La description doit contenir au moins 5 caractères"),
  userId: z.number().int().positive(),
  dateDebut: dateSchema,
  dateFin: dateSchema,
  images: z.array(z.string()).optional(),
  statut: z.string().optional(),
  archive: z.boolean().optional(),
});

// 🔹 Mise à jour
export const updateEvenementSchema = z.object({
  titre: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  dateDebut: dateSchema.optional(),
  dateFin: dateSchema.optional(),
  images: z.array(z.string()).optional(),
  statut: z.string().optional(),
  archive: z.boolean().optional(),
});
