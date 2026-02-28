import { z } from "zod";

// ---------- Crédit ----------
export const createCreditSchema = z.object({
  beneficiaireId: z.number(),
  agentId: z.number().optional(), // facultatif
  montant: z.number().min(0, "Le montant doit être supérieur ou égal à 0"),
  tauxInteret: z.number().min(0).optional(),
  dateDebut: z.string().datetime("Format de date invalide"),
  dateFin: z.string().datetime("Format de date invalide"),
  status: z.string().optional(), // peut être EN_COURS, TERMINE, etc.
});

export const updateCreditSchema = z.object({
  beneficiaireId: z.number().optional(),
  agentId: z.number().optional(),
  montant: z.number().min(0).optional(),
  tauxInteret: z.number().min(0).optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
  status: z.string().optional(),
  archive: z.boolean().optional(),
  archivedAt: z.string().datetime().optional(),
});