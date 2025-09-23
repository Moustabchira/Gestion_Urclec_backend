import { Request, Response } from "express";
import AuthService from "../services/AuthService";
import * as status from "../utils/constantes"

const authService = new AuthService();

export default class AuthController {

  // Inscription d'un utilisateur avec rôle(s) et permissions
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.register(req.body);

      // Supprimer le mot de passe avant renvoi
      const { password, ...userWithoutPassword } = user;

      res.status(status.HTTP_STATUS_CREATED).json({ 
        message: "Utilisateur créé avec succès", 
        user: userWithoutPassword 
      });
    } catch (error: any) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ error: error.message });
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

      const { token, userPayload } = await authService.login(email, password);

      res.status(status.HTTP_STATUS_OK).json({ 
        message: "Connexion réussie", 
        user: userPayload, 
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
