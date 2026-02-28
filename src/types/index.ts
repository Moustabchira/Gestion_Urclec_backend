// ---------- Enums ----------
export type EtatEquipement = "FONCTIONNEL" | "EN_PANNE" | "EN_REPARATION" | "HORS_SERVICE" | "EN_TRANSIT";
export type StatusEquipement = "DISPONIBLE" | "ASSIGNE";
export type TypeMouvement = "AFFECTATION" | "TRANSFERT" | "REPARATION" | "RETRAIT" | "RETROUVE" | "RETOUR_REPARATION";
export type StatutMouvement = "EN_ATTENTE" | "CONFIRME" | "REJETE" | "EN_TRANSIT" | "EN_REPARATION" | "RETIRE" | "BON" | "ABIME" | "PERDU";
export type StatutEvenement = "EN_ATTENTE" | "VALIDE" | "REJETE" | "PUBLIE";

// ---------- Agence ----------
export interface Agence {
  id: number;
  nom_agence: string;
  code_agence: string;
  ville: string;
  users?: User[];
  pointService?: PointDeService[];
  mouvementsSource?: MouvementEquipement[];
  mouvementsDestination?: MouvementEquipement[];
  equipementsActuels?: Equipement[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Poste ----------
export interface Poste {
  id: number;
  nom: string;
  users?: User[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- PointDeService ----------
export interface PointDeService {
  id: number;
  nom: string;
  agenceId: number;
  agence?: Agence;
  mouvementsSource?: MouvementEquipement[];
  mouvementsDest?: MouvementEquipement[];
  equipementsActuels?: Equipement[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- User ----------
export interface User {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  password: string;
  code_identifiant: string;

  agenceId: number;
  agence?: Agence;

  posteId: number;
  poste?: Poste;

  chefId?: number | null;
  chef?: User | null;
  subordonnes?: User[];

  actionCredits?: ActionCredit[];
  creditsBeneficiaire?: Credit[];
  creditAgent?: Credit[];
  decisions?: Decision[];
  roles?: UserRole[];
  demandes?: Demande[];
  demandesAValider?: Demande[];
  evenementsCrees?: Evenement[];
  evenementsPublies?: Evenement[];
  equipementsActuels?: Equipement[];
  mouvementsInitie?: MouvementEquipement[];
  mouvementsConfirmes?: MouvementEquipement[];
  mouvementsResponsableSource?: MouvementEquipement[];
  mouvementsResponsableDest?: MouvementEquipement[];

  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Role ----------
export interface Role {
  id: number;
  nom: string;
  slug: string;
  rolePermissions?: RolePermission[];
  userRoles?: UserRole[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- UserRole ----------
export interface UserRole {
  userId: number;
  roleId: number;
  assignedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
  user?: User;
  role?: Role;
}

// ---------- Permission ----------
export interface Permission {
  id: number;
  nom: string;
  slug: string;
  rolePermissions?: RolePermission[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- RolePermission ----------
export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  role?: Role;
  permission?: Permission;
  createdAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Demande ----------
export interface Demande {
  id: number;
  type: string;
  dateDebut: Date;
  dateFin: Date;
  motif: string;
  status: string;
  pdfPath?: string | null;
  userId: number;
  user?: User;
  conge?: Conge | null;
  absence?: Absence | null;
  demandePermission?: DemandePermission | null;
  decisions?: Decision[];
  currentApproverId?: number | null;
  currentApprover?: User | null;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Conge ----------
export interface Conge {
  id: number;
  nbJours: number;
  demandeId: number;
  demande?: Demande;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Absence ----------
export interface Absence {
  id: number;
  justification: string;
  demandeId: number;
  demande?: Demande;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- DemandePermission ----------
export interface DemandePermission {
  id: number;
  duree: string;
  demandeId: number;
  demande?: Demande;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Decision ----------
export interface Decision {
  id: number;
  status: string;
  niveau: string;
  userId: number;
  user?: User;
  demandeId: number;
  demande?: Demande;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Equipement ----------
export interface Equipement {
  id: number;
  nom: string;
  modele?: string | null;
  images?: string[]; // JSON parse/stringify
  dateAcquisition: Date;
  etat: EtatEquipement;
  status: StatusEquipement;
  responsableActuelId?: number | null;
  responsableActuel?: User | null;
  agenceActuelleId?: number | null;
  agenceActuelle?: Agence | null;
  pointServiceActuelId?: number | null;
  pointServiceActuel?: PointDeService | null;
  mouvements?: MouvementEquipement[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- MouvementEquipement ----------
export interface MouvementEquipement {
  id: number;
  type: TypeMouvement;
  statut: StatutMouvement;
  commentaire?: string | null;
  equipementId: number;
  equipement?: Equipement;
  initiateurId: number;
  initiateur?: User;
  agenceSourceId?: number | null;
  agenceSource?: Agence;
  agenceDestinationId?: number | null;
  agenceDestination?: Agence;
  pointServiceSourceId?: number | null;
  pointServiceSource?: PointDeService;
  pointServiceDestinationId?: number | null;
  pointServiceDestination?: PointDeService;
  responsableSourceId?: number | null;
  responsableSource?: User;
  responsableDestinationId?: number | null;
  responsableDestination?: User;
  confirme?: boolean;
  confirmeParId?: number | null;
  confirmePar?: User;
  dateConfirmation?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Evenement ----------
export interface Evenement {
  id: number;
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  images?: string[]; // JSON parse
  statut: StatutEvenement;
  userId: number;
  user?: User;
  publishedBy?: number | null;
  publieur?: User | null;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Credit ----------
export interface Credit {
  id: number;
  reference: string;
  montant: number;
  montantRembourse: number;
  tauxInteret: number;
  dateDebut: Date;
  dateFin: Date;
  status: string;
  beneficiaireId: number;
  beneficiaire?: User;
  agentId?: number | null;
  agent?: User | null;
  actions?: ActionCredit[];
  histories?: CreditHistory[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- ActionCredit ----------
export interface ActionCredit {
  id: number;
  creditId: number;
  credit?: Credit;
  agentId?: number | null;
  agent?: User | null;
  type: string;
  commentaire?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
  notifications?: Notification[];
}

// ---------- CreditHistory ----------
export interface CreditHistory {
  id: number;
  creditId: number;
  credit?: Credit;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
  updatedAt: Date;
}

// ---------- Notification ----------
export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  canal: string;
  lu: boolean;
  luAt?: Date | null;
  userId: number;
  user?: User;
  equipementId?: number | null;
  equipement?: Equipement | null;
  mouvementId?: number | null;
  mouvement?: MouvementEquipement | null;
  actionCreditId?: number | null;
  actionCredit?: ActionCredit | null;
  createdAt: Date;
}
