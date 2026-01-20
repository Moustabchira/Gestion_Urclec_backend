import { z } from "zod";

// ---------- Equipement ----------
export const createEquipementSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  modele: z.string().optional().nullable(),
  etat: z.enum(["FONCTIONNEL", "EN_PANNE", "EN_REPARATION", "HORS_SERVICE", "EN_TRANSIT"]).optional(),
  status: z.enum(["DISPONIBLE", "ASSIGNE", "INDISPONIBLE"]).optional(),
  images: z.array(z.string()).optional(),
  dateAcquisition: z.coerce.date().optional(),
  responsableActuelId: z.number().int().positive().optional().nullable(),
  agenceActuelleId: z.number().int().positive().optional().nullable(),
  pointServiceActuelId: z.number().int().positive().optional().nullable(),
});

export const updateEquipementSchema = createEquipementSchema.partial();

// ---------- MouvementEquipement ----------
export const MouvementTypeEnum = z.enum([
  "AFFECTATION",
  "RETROUVE",
  "TRANSFERT",
  "REPARATION",
  "RETOUR_REPARATION",
  "RETRAIT",
]);

export const createMouvementSchema = z.object({
  type: MouvementTypeEnum,
  commentaire: z.string().optional().nullable(),
  equipementId: z.number().int().positive(),
  initiateurId: z.number().int().positive(),
  agenceSourceId: z.number().int().positive().optional().nullable(),
  agenceDestinationId: z.number().int().positive().optional().nullable(),
  pointServiceSourceId: z.number().int().positive().optional().nullable(),
  pointServiceDestinationId: z.number().int().positive().optional().nullable(),
  responsableDestinationId: z.number().int().positive().optional().nullable(),
  confirmeParId: z.number().int().positive().optional().nullable(),
  confirme: z.boolean().optional(),
  dateConfirmation: z.coerce.date().optional().nullable(),
  // ✅ Nouveaux champs pour suivre l'état avant et après le mouvement
  etatAvant: z.enum(["FONCTIONNEL", "EN_PANNE", "EN_REPARATION", "HORS_SERVICE", "EN_TRANSIT"]).optional().nullable(),
  etatApres: z.enum(["FONCTIONNEL", "EN_PANNE", "EN_REPARATION", "HORS_SERVICE", "EN_TRANSIT"]).optional().nullable(),
});

export const updateMouvementSchema = createMouvementSchema.partial();

