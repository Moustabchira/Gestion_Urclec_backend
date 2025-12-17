import { Request, Response, NextFunction } from "express";

export const restrictByRole = () => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Utilisateur non authentifié" });

    const roles = req.user.roles;

    if (roles.includes("DG") || roles.includes("DRH") || roles.includes("ADMIN")) {
      return next(); // accès complet
    } 
    if (roles.includes("CHEF")) {
      req.filter = { agenceId: req.user.agenceId };
    } else if (roles.includes("EMPLOYE")) {
      req.filter = { userId: req.user.id };
    } else {
      return res.status(403).json({ message: "Rôle non autorisé" });
    }

    next();
  };
};
