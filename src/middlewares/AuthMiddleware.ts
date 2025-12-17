import { Request, Response, NextFunction } from 'express';
import prismaClient from '../utils/prismaClient';
import jwt from 'jsonwebtoken';
import * as status from '../utils/constantes';

const SECRET_KEY = process.env.JWT_SECRET || 'default_jwt_secret';

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    if (!token) return res.status(status.HTTP_STATUS_UNAUTHORIZED).json({ message: 'Accès non autorisé' });

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number, roles: string[] };
    const user = await prismaClient.user.findUnique({
      where: { id: decoded.userId },
      include: { roles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } } }
    });

    if (!user) return res.status(status.HTTP_STATUS_UNAUTHORIZED).json({ message: 'Utilisateur non trouvé' });

    const permissions: string[] = user.roles.flatMap(ur => ur.role.rolePermissions.map(rp => rp.permission.slug));

    req.user = {
      id: user.id,
      email: user.email,
      agenceId: user.agenceId,
      roles: user.roles.map(r => r.role.slug),
      permissions,
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(status.HTTP_STATUS_FORBIDDEN).json({ message: 'Token invalide ou expiré' });
  }
};
