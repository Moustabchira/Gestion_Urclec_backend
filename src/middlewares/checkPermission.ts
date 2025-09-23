import { Request, Response, NextFunction } from 'express';

export const checkPermission = (requiredPermission: string) => {

  return (req: Request, res: Response, next: NextFunction): void => {
    
    if (!req.user || !req.user.permissions) {
      res.status(403).json({ message: "Permissions non trouvées." });
      return;
    }

    const hasPermission = req.user.permissions.includes(requiredPermission);

    if (!hasPermission) {
      res.status(403).json({ message: "Permission refusée." });
      return;
    }

    next();
  };
};
