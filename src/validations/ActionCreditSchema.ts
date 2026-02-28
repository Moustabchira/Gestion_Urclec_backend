import { z } from "zod";


// ---------- ActionCredit ----------
export const actionTypesEnum = ["VISITE", "RAPPEL", "REMBOURSEMENT", "SUSPENSION", "RELANCE", "VALIDATION"] as const;

export const createActionSchema = z.object({
  creditId: z.number(),
  agentId: z.number().optional(),
  type: z.enum(actionTypesEnum),
  commentaire: z.string().optional(),
  date: z.string().datetime().optional(), // facultatif, par défaut now()
});

export const updateActionSchema = z.object({
  creditId: z.number().optional(),
  agentId: z.number().optional(),
  type: z.enum(actionTypesEnum).optional(),
  commentaire: z.string().optional(),
  archive: z.boolean().optional(),
  archivedAt: z.string().datetime().optional(),
});
