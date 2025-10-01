import prismaClient from "../utils/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import RoleService from "./RoleService";
import PermissionService from "./PermissionService";
import { User, AuthPayload } from "../types/index";
import { generateCodeIdentifiant } from "../utils/generateCodeIdentifiant";

const SECRET_KEY = process.env.JWT_SECRET || "default_jwt_secret";

interface RegisterData {
  nom: string;
  prenom: string;
  username: string;
  email: string;
  password: string;
  poste: string;      // obligatoire
  agenceId: number;   // obligatoire
  chefId?: number;
  role?: { name: string; permissions?: string[] };
}

interface LoginResult {
  userPayload: AuthPayload;
  token: string;
}

export default class AuthService {

  public async register(userData: RegisterData): Promise<User> {
    try {
      const { nom, prenom, username, email, password, poste, agenceId, chefId, role } = userData;

      // Vérifie si l'utilisateur existe déjà
      const existingUser = await prismaClient.user.findFirst({ 
        where: { OR: [{ email }, { username }] } 
      });
      if (existingUser) throw new Error("Email ou nom d’utilisateur déjà utilisé");

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Génération du code identifiant
      const codeIdentifiant = generateCodeIdentifiant();

      // Création de l'utilisateur
      const newUser = await prismaClient.user.create({
        data: { 
          nom, 
          prenom, 
          username, 
          email, 
          password: hashedPassword,
          code_identifiant: codeIdentifiant,
          poste,        
          agenceId,     
          chefId,      
        },
      });

      // Gestion des rôles
      if (role?.name) {
        const roleService = new RoleService();
        const permissionService = new PermissionService();

        let existingRole = await roleService.getRoleBySlug(role.name);
        if (!existingRole) {
          const permissionIds = role.permissions 
            ? await permissionService.getPermissionIdsBySlugs(role.permissions) 
            : [];
          existingRole = await roleService.createRole({ nom: role.name, permissionIds });
        }

        await prismaClient.userRole.create({ 
          data: { userId: newUser.id, roleId: existingRole.id } 
        });
      }

      return newUser;

    } catch (error) {
      throw new Error(`Erreur lors de l'inscription : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }

  public async login(email: string, password: string): Promise<LoginResult> {
    try {
      const user = await prismaClient.user.findUnique({
        where: { email },
        include: { roles: { include: { role: true } } },
      });

      if (!user) throw new Error("Utilisateur non trouvé");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Mot de passe incorrect");

      const userRoles = user.roles.map(ur => ur.role.slug);

      const token = jwt.sign({ userId: user.id, roles: userRoles }, SECRET_KEY, { expiresIn: "1h" });

      const userPayload: AuthPayload = { userId: user.id, email: user.email, username: user.username, roles: userRoles };

      return { token, userPayload };
    } catch (error) {
      throw new Error(`Erreur lors de la connexion : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }
}
