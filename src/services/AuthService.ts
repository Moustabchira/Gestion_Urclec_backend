import prismaClient from "../utils/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUserSchema } from "../validations/userSchema";
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
  user: AuthPayload;
  token: string;
}

export default class AuthService {

  public async register(userData: RegisterData): Promise<User> {
    // 🔹 Validation des données
    const validated = createUserSchema.parse({
      ...userData,
      code_identifiant: generateCodeIdentifiant(),
    });

    validated.password = await bcrypt.hash(validated.password, 10);
    if (validated.chefId === undefined) validated.chefId = null;

    // 🔹 Vérifier si email ou username existe déjà
    const existingUser = await prismaClient.user.findFirst({
      where: { OR: [{ email: validated.email }, { username: validated.username }] },
    });
    if (existingUser) throw new Error("Email ou username déjà utilisé");

    // 🔹 Création de l'utilisateur avec rôle(s) et chef
    const newUser = await prismaClient.user.create({
      data: {
        ...validated,
        posteId: validated.posteId,
        roles: validated.roles?.length
          ? { create: validated.roles.map(roleId => ({ roleId })) }
          : undefined,
      },
      include: {
        roles: { include: { role: true } },
        poste: true,
        agence: true,
        chef: true,
      },
    });

    return newUser;
  }


  public async login(email: string, password: string): Promise<LoginResult> {
    try {
      const user_exist = await prismaClient.user.findUnique({
        where: { email },
        include: { roles: { include: { role: true } } },
      });

      if (!user_exist) throw new Error("Utilisateur non trouvé");

      const isValid = await bcrypt.compare(password, user_exist.password);
      if (!isValid) throw new Error("Mot de passe incorrect");

      const userRoles = user_exist.roles.map(ur => ur.role.slug);

      const token = jwt.sign({ userId: user_exist.id, roles: userRoles }, SECRET_KEY, { expiresIn: "1h" });

      const user: AuthPayload = { userId: user_exist.id, email: user_exist.email, username: user_exist.username, roles: userRoles };

      return { token, user };
    } catch (error) {
      throw new Error(`Erreur lors de la connexion : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    }
  }
}
