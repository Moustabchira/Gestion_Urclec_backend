import { z } from "zod";

export const createUserSchema = z.object({
  nom: z.string().min(2),
  prenom: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  posteId: z.number().int().positive(),
  agenceId: z.number().int().positive(),
  chefId: z.number().int().nullable().optional(),
  code_identifiant: z.string(),
  roles: z.array(z.number()).optional(),
});

export const updateUserSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  posteId: z.number().int().positive().optional(),
  agenceId: z.number().int().positive().optional(),
  chefId: z.number().int().nullable().optional(),
  roles: z.array(z.number()).optional(),
});
