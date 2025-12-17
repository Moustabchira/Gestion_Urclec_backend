import { z } from "zod";

export const createCreditSchema = z.object({
  beneficiaireId: z.number(),
  montant: z.number().min(0),
  tauxInteret: z.number().min(0).optional(),
  dateDebut: z.string(),
  dateFin: z.string(),
  status: z.string().optional(),
});

export const updateCreditSchema = z.object({
  montant: z.number().min(0).optional(),
  tauxInteret: z.number().min(0).optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  status: z.string().optional(),
  archive: z.boolean().optional(),
});
