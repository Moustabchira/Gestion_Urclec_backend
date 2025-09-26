import { Request, Response, NextFunction } from 'express';
import * as status from '../utils/constantes';
import prismaClient from '../utils/prismaClient';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default_jwt_secret';


// Middleware pour vérifier le token JWT
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

        const authHeader = req.headers.authorization;
        let token: string | undefined;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader?.substring(7);
        } 

        if (!token) {
            res.status(status.HTTP_STATUS_UNAUTHORIZED).json({ message: 'Accès non autorisé' });
            return;
        }

        const decoded = jwt.verify(token, SECRET_KEY) as { userId: number, roles: string[] };
        const { userId } = decoded;


        if (!userId) {
            res.status(status.HTTP_STATUS_FORBIDDEN).json({ message: 'Token invalide ou expiré' });
            return;
        }

        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            res.status(status.HTTP_STATUS_UNAUTHORIZED).json({ message: 'Utilisateur non trouvé' });
            return;
        }

        const permissions: string[] = user.roles.flatMap(ur => 
            ur.role.rolePermissions.map(rp => rp.permission.slug)
        );

        req.user = { 
            id: user.id, 
            email: user.email, 
            permissions 
        };
        next();

    } catch (error) {
        console.error('Erreur dans le middleware d\'authentification :', error);
        res.status(status.HTTP_STATUS_FORBIDDEN).json({ message: 'Token invalide ou expiré' });
        return;

    }

}