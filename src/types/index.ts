// ---------- Agence ----------
export interface Agence {
  id: number;
  nom_agence: string;
  code_agence: string;
  ville: string;
  users?: User[];
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

export interface PointDeService {
  id: number;
  nom: string;

  // Relation vers Agence
  agenceId: number;
  agence?: Agence;

  affectationsOrigine?: AffectationEquipement[];
  affectationsDest?: AffectationEquipement[];
  
  // Métadonnées communes
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
  evenementsCrees?: Evenement[];
  evenementsValides?: Evenement[];
  eventementsPublies?: Evenement[];
  equipementsPossedes?: Equipement[];
  affectations?: AffectationEquipement[];

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
  role?: Role;
  user?: User;
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

// ---------- Equipements ----------
export interface Equipement {
  id: number;
  nom: string;
  modele?: string | null;
  categorie?: string | null;
  quantiteTotale: number;
  quantiteDisponible: number;
  images?: string | null; // JSON stringifié pour SQL Server
  dateAcquisition: Date;
  status: string; // ACTIF, HORS_SERVICE
  proprietaireId?: number | null;
  proprietaire?: User | null;
  affectations?: AffectationEquipement[];
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface AffectationEquipement {
  id: number;
  equipementId: number;
  employeId: number;
  pointServiceOrigineId?: number | null;
  pointServiceDestId?: number | null;
  quantite: number;
  status?: "BON" | "ABIME" | "PERDU" | "RETIRE";
  dateAffectation: Date;
  dateFin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  equipement?: Equipement;
  employe?: User;
  pointServiceOrigine?: PointDeService;
  pointServiceDest?: PointDeService;
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
  images?: string | null; // JSON stringifié pour SQL Server
  statut: string; // EN_ATTENTE, VALIDE, REJETE, PUBLIE
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
  commentaire: string;
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
