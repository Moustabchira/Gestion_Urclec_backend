import { z } from "zod";

export const createEquipementSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  modele: z.string().optional(),
  categorie: z.string().optional(),
  status: z.enum(["ACTIF", "HORS_SERVICE"]).optional(),
  images: z.array(z.string()).optional(),
  dateAcquisition: z.coerce.date().optional(),
});

export const updateEquipementSchema = createEquipementSchema.partial();


export const createAffectationSchema = z.object({
  equipementId: z.number().int().positive(),
  employeId: z.number().int().positive(),
  quantite: z.number().int().positive(),
  pointServiceOrigineId: z.number().int().positive(),
  pointServiceDestId: z.number().int().positive(),
  status: z.enum(["BON", "RETIRE", "HORS_SERVICE"]).optional()
});

export const updateAffectationStatusSchema = z.object({
  status: z.string().optional(),
});