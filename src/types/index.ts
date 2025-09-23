export interface User {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  actions?: Action[];
  decisions?: Decision[];
  equipements?: Equipement[];
  evenements?: Evenement[];
  roles?: UserRole[];
  demandes?: Demande[];
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Role {
  id: number;
  nom: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  permissions?: RolePermission[];
  userRoles?: UserRole[];
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
  createdAt: Date;
  updatedAt: Date;
  roles?: RolePermission[];
  archive: boolean;
  archivedAt?: Date | null;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  createdAt: Date;
  permission?: Permission;
  role?: Role;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Decision {
  id: number;
  status: string;
  niveau: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  demandeId: number;
  demande?: Demande;
  user?: User;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Demande {
  id: number;
  type: string;
  dateDebut: Date;
  dateFin: Date;
  motif: string;
  status: string; // "EN_ATTENTE" | "APPROUVEE" | "REFUSEE"
  createdAt: Date;
  updatedAt: Date;
  absence?: Absence;
  conge?: Conge;
  decisions?: Decision[];
  demandePermission?: DemandePermission;
  userId: number;
  user?: User;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Conge {
  id: number;
  nbJours: number;
  createdAt: Date;
  updatedAt: Date;
  demandeId: number;
  demande?: Demande;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Absence {
  id: number;
  justification: string;
  createdAt: Date;
  updatedAt: Date;
  demandeId: number;
  demande?: Demande;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface DemandePermission {
  id: number;
  duree: string;
  createdAt: Date;
  updatedAt: Date;
  demandeId: number;
  demande?: Demande;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Evenement {
  id: number;
  titre: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user?: User;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Equipement {
  id: number;
  nom: string;
  modele: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user?: User;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Action {
  id: number;
  type: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user?: User;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface Beneficiaire {
  id: number;
  localisation: string;
  createdAt: Date;
  updatedAt: Date;
  archive: boolean;
  archivedAt?: Date | null;
}

export interface AuthPayload {
  userId: number;
  username: string;
  email: string;
  roles: string[];
}
