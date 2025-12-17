import { z } from "zod";

export const createActionSchema = z.object({
  creditId: z.number(),
  agentId: z.number(),
  type: z.enum(["VISITE", "RAPPEL", "REMBOURSEMENT", "SUSPENSION", "RELANCE", "VALIDATION"]),
  commentaire: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateActionSchema = z.object({
  type: z.enum(["VISITE", "RAPPEL", "REMBOURSEMENT", "SUSPENSION", "RELANCE", "VALIDATION"]),
  commentaire: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
