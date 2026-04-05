import { z } from "zod";

export const createDemandeSchema = z.object({
  type: z.enum(["CONGE", "PERMISSION"]),

  dateDebut: z.string()
    .min(1, "Date début obligatoire")
    .refine(d => !isNaN(Date.parse(d)), {
      message: "Date invalide"
    }),

  dateFin: z.string()
    .min(1, "Date fin obligatoire")
    .refine(d => !isNaN(Date.parse(d)), {
      message: "Date invalide"
    }),

  motif: z.string().min(3, "Motif trop court"),

  userId: z.coerce.number().int(),

  status: z.enum(["EN_ATTENTE", "APPROUVE", "REFUSE"]).optional(),
})
.superRefine((data, ctx) => {
  if (new Date(data.dateFin) < new Date(data.dateDebut)) {
    ctx.addIssue({
      code: "custom",
      path: ["dateFin"],
      message: "La date de fin doit être après la date de début",
    });
  }
});

export const updateDemandeSchema = createDemandeSchema.partial();