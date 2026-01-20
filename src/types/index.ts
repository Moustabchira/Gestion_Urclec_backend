// ---------- Agence ----------
export interface Agence {
  id: number;
  nom_agence: string;
  code_agence: string;
  ville: string;
  users?: User[];
  pointServices?: PointDeService[];
  mouvementsSource?: MouvementEquipement[];
  mouvementsDestination?: MouvementEquipement[];
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
  mouvementsDestination?: MouvementEquipement[];
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
  decisions?: Decision[];
  roles?: UserRole[];
  demandes?: Demande[];
  demandesAValider?: Demande[];
  evenementsCrees?: Evenement[];
  evenementsPublies?: Evenement[];
  equipementsPossedes?: Equipement[];
  mouvementsInitie?: MouvementEquipement[];
  mouvementsConfirmes?: MouvementEquipement[];
  mouvementsResponsable?: MouvementEquipement[];

  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Rôles et Permissions ----------
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

export interface UserRole {
  userId: number;
  roleId: number;
  assignedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
  user?: User;
  role?: Role;
}

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

// ---------- Demandes ----------
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

// ---------- Décision ----------
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
  images?: string[]; // tableau de string, JSON parse
  dateAcquisition: Date;
  etat: "ACTIF" | "HORS_SERVICE" | "EN_PANNE" | "EN_TRANSIT" | "EN_REPARATION" | "DISPONIBLE" | "ASSIGNE";
  status: "DISPONIBLE" | "ASSIGNE";
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
  type: "AFFECTATION" | "TRANSFERT" | "REPARATION" | "RETRAIT" | "RETROUVE"| "RETOUR_REPARATION";
  statut: "EN_ATTENTE" | "CONFIRME" | "REJETE" | "EN_TRANSIT" | "EN_REPARATION" | "RETIRE" | "BON" | "ABIME" | "PERDU";
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
  responsableDestinationId?: number | null;
  responsableDestination?: User;
  confirmeParId?: number | null;
  confirmePar?: User;
  confirme?: boolean;
  dateConfirmation?: Date | null;
  createdAt: Date;
}

// ---------- Evenement ----------
export interface Evenement {
  id: number;
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  images?: string[]; // JSON parse
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE" | "PUBLIE";
  userId: number;
  user?: User;
  validatedBy?: number | null;
  validateur?: User | null;
  publishedBy?: number | null;
  publieur?: User | null;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- ActionCredit ----------
export interface ActionCredit {
  id: number;
  type: string;
  commentaire?: string | null;
  date: Date;
  creditId: number;
  credit?: Credit;
  agentId: number;
  agent?: User;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- Credit ----------
export interface Credit {
  id: number;
  beneficiaireId: number;
  beneficiaire?: User;
  montant: number;
  montantRembourse?: number;
  tauxInteret?: number | null;
  dateDebut: Date;
  dateFin: Date;
  status?: string | null;
  actions?: ActionCredit[];
  histories?: CreditHistory[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

// ---------- CreditHistory ----------
export interface CreditHistory {
  id: number;
  creditId: number;
  credit?: Credit;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedAt: Date;
}

// ---------- AuthPayload ----------
export interface AuthPayload {
  userId: number;
  username: string;
  email: string;
  roles: string[];
}
