import { z } from "zod";

export const createUserSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  username: z.string().min(3, "Le username doit contenir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  poste: z.string().min(2, "Le poste doit contenir au moins 2 caractères"),
  agenceId: z.number(),
  chefId: z.number().nullable().optional(),
  code_identifiant: z.string(),
});

export const updateUserSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  poste: z.string().min(2).optional(),
  agenceId: z.number().optional(),
  chefId: z.number().nullable().optional(),
});
