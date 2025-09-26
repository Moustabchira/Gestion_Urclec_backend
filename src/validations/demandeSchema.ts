import { z } from "zod";

export const createDemandeSchema = z.object({
  type: z.enum(["conge", "absence", "permission"]),
  dateDebut: z.string().refine(d => !isNaN(Date.parse(d)), { message: "Date invalide" }),
  dateFin: z.string().refine(d => !isNaN(Date.parse(d)), { message: "Date invalide" }),
  motif: z.string().min(3, "Motif trop court"),
  userId: z.number().int(),
  nbJours: z.number().int().optional(),
  justification: z.string().optional(),
  duree: z.string().optional(),
  status: z.enum(["EN_ATTENTE", "APPROUVEE", "REFUSEE"]).optional(),
});

export const updateDemandeSchema = createDemandeSchema.partial();
