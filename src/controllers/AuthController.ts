import { Request, Response } from "express";
import AuthService from "../services/AuthService";
import * as status from "../utils/constantes"
import jwt from "jsonwebtoken";

const authService = new AuthService();
const SECRET_KEY = process.env.JWT_SECRET || "default_jwt_secret";


export default class AuthController {

  // Inscription d'un utilisateur avec rôle(s) et permissions
 
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.register(req.body);
      const { password, ...userWithoutPassword } = user;

      const userRoles = userWithoutPassword.roles?.map(r => r.role?.slug).filter(Boolean) || [];
      const token = jwt.sign(
        { userId: userWithoutPassword.id, roles: userRoles },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.status(201).json({
        message: "Utilisateur créé avec succès",
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }




  // Connexion et récupération du token JWT
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email et mot de passe sont requis." });
        return;
      }

      const { token, user } = await authService.login(email, password);

      res.status(status.HTTP_STATUS_OK).json({ 
        message: "Connexion réussie", 
        user,
        token: token 
      });
    } catch (error: any) {
      res.status(status.HTTP_STATUS_UNAUTHORIZED).json({ error: error.message });
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    res.status(status.HTTP_STATUS_OK).json({ message: "Déconnexion réussie" });
  }
}
