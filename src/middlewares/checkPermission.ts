import { Request, Response, NextFunction } from "express";

export const checkPermission = (slug: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const user = req.user;

    // ✅ Si l'utilisateur est ADMIN, DG ou DRH → accès complet sans vérifier la permission
    if (user.roles?.includes("ADMIN") || user.roles?.includes("DG") || user.roles?.includes("DRH")) {
      return next();
    }

    // 🚫 Si pas de permissions définies sur l'utilisateur
    if (!user.permissions || !Array.isArray(user.permissions)) {
      return res.status(403).json({ message: "Aucune permission associée à cet utilisateur." });
    }

    // 🔍 Vérification de la permission demandée
    if (!user.permissions.includes(slug)) {
      return res.status(403).json({ message: "Permission refusée." });
    }

    next();
  };
};
