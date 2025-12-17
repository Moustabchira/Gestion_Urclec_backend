import { Express } from "express";
import prismaClient from "../utils/prismaClient";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";
import RoleController from "../controllers/RoleController";
import PermissionController from "../controllers/PermissionController";
import DemandeController from "../controllers/DemandeController";
import CongeController from "../controllers/CongeController";
import AbsenceController from "../controllers/AbsenceController";
import EvenementController from "../controllers/EvenementController";
import AgenceController from "../controllers/AgenceController";
import PosteController from "../controllers/PosteController";

import { authMiddleware } from "../middlewares/AuthMiddleware";
import { checkPermission } from "../middlewares/checkPermission";
import { restrictByRole } from "../middlewares/RoleMiddleware";

const authController = new AuthController();
const userController = new UserController();
const roleController = new RoleController();
const permissionController = new PermissionController();
const demandeController = new DemandeController();
const congeController = new CongeController();
const absenceController = new AbsenceController();
const evenementController = new EvenementController();
const agenceController = new AgenceController();
const posteController = new PosteController();

export default (app: Express): void => {

  // ====================== AUTH ======================
  app.post('/register', authController.register.bind(authController));
  app.post('/login', authController.login.bind(authController));
  app.post('/logout', authController.logout.bind(authController));
  app.get("/api/me", authMiddleware, async (req: any, res: any) => {
    try {
      const user = await prismaClient.user.findUnique({
        where: { id: req.user.id },
        include: {
          poste: true,
          roles: { include: { role: true } },
        },
      });

      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

      res.json({
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        poste: user.poste?.nom,
        roles: user.roles.map((ur) => ur.role.slug),
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // ====================== USERS ======================
  app.get('/users', authMiddleware, checkPermission('voir_les_utilisateurs'), restrictByRole(), userController.getAllUsers.bind(userController));
  app.get('/users/:id', authMiddleware, checkPermission('voir_un_utilisateur'), restrictByRole(), userController.getUserById.bind(userController));
  app.post('/users', authMiddleware, checkPermission('creer_utilisateur'), userController.createUser.bind(userController));
  app.put('/users/:id', authMiddleware, checkPermission('modifier_utilisateur'), userController.updateUser.bind(userController));
  app.delete('/users/:id', authMiddleware, checkPermission('supprimer_utilisateur'), userController.deleteUser.bind(userController));
  app.post('/users/:userId/roles/:roleId', authMiddleware, checkPermission('attribuer_un_role_a_un_utilisateur'), userController.assignRoleToUser.bind(userController));
  app.delete('/users/:userId/roles/:roleId', authMiddleware, checkPermission('retirer_un_role_dun_utilisateur'), userController.removeRoleFromUser.bind(userController));
  app.post('/users/:userId/chef/:chefId', authMiddleware, checkPermission('modifier_utilisateur'), userController.assignChefToUser.bind(userController));
  app.get('/users/agence/:agenceId', authMiddleware, checkPermission('voir_les_utilisateurs'), restrictByRole(), userController.getUsersByAgence.bind(userController));

  // ====================== ROLES ======================
  app.get('/roles', authMiddleware, checkPermission('voir_les_roles'), roleController.getRoles.bind(roleController));
  app.get('/roles/:id', authMiddleware, checkPermission('voir_un_role'), roleController.getRoleById.bind(roleController));
  app.post('/roles', authMiddleware, checkPermission('creer_un_role'), roleController.createRole.bind(roleController));
  app.put('/roles/:id', authMiddleware, checkPermission('modifier_un_role'), roleController.updateRole.bind(roleController));
  app.delete('/roles/:id', authMiddleware, checkPermission('supprimer_un_role'), roleController.deleteRole.bind(roleController));
  app.post('/roles/:roleId/permissions', authMiddleware, checkPermission('attribuer_des_permissions_aux_roles'), roleController.assignPermissionToRole.bind(roleController));
  app.delete('/roles/:roleId/permissions', authMiddleware, checkPermission('retirer_les_permissions_dun_role'), roleController.removePermissionFromRole.bind(roleController));

  // ====================== PERMISSIONS ======================
  app.get('/permissions', authMiddleware, checkPermission('voir_les_permissions'), permissionController.getPermissions.bind(permissionController));
  app.get('/permissions/:id', authMiddleware, checkPermission('voir_une_permission'), permissionController.getPermissionById.bind(permissionController));
  app.delete('/permissions/:id', authMiddleware, checkPermission('supprimer_une_permission'), permissionController.deletePermission.bind(permissionController));

  // ====================== DEMANDES ======================
  app.get('/demandes', authMiddleware, checkPermission('voir_les_demandes'), restrictByRole(), demandeController.getAll.bind(demandeController));
  app.get('/demandes/:id', authMiddleware, checkPermission('voir_une_demande'), restrictByRole(), demandeController.getOne.bind(demandeController));
  app.post('/demandes', authMiddleware, checkPermission('faire_une_demande'), demandeController.create.bind(demandeController));
  app.put('/demandes/:id', authMiddleware, checkPermission('modifier_une_demande'), demandeController.update.bind(demandeController));
  app.delete('/demandes/:id', authMiddleware, checkPermission('supprimer_une_demande'), demandeController.delete.bind(demandeController));
  app.post('/demandes/:demandeId/decisions', authMiddleware, checkPermission('valider_une_demande'), demandeController.prendreDecision.bind(demandeController));
  app.get('/demandes/:id/pdf', authMiddleware, checkPermission('voir_une_demande'), demandeController.generatePdf.bind(demandeController));

  // ====================== CONGES ======================
  app.get('/conges', authMiddleware, checkPermission('voir_les_demandes'), restrictByRole(), congeController.getAll.bind(congeController));
  app.get('/conges/:id', authMiddleware, checkPermission('voir_une_demande'), restrictByRole(), congeController.getOne.bind(congeController));

  // ====================== ABSENCES ======================
  app.get('/absences', authMiddleware, checkPermission('voir_les_demandes'), restrictByRole(), absenceController.getAllAbsences.bind(absenceController));
  app.get('/absences/:id', authMiddleware, checkPermission('voir_une_demande'), restrictByRole(), absenceController.getAbsenceById.bind(absenceController));

  // ====================== EVENEMENTS ======================
  app.get('/evenements', authMiddleware, checkPermission('voir_les_evenements'), restrictByRole(), evenementController.getAllEvenements.bind(evenementController));
  app.get('/evenements/:id', authMiddleware, checkPermission('voir_un_evenement'), restrictByRole(), evenementController.getEvenementById.bind(evenementController));
  app.post('/evenements', authMiddleware, checkPermission('creer_un_evenement'), restrictByRole(), evenementController.createEvenement.bind(evenementController));
  app.put('/evenements/:id', authMiddleware, checkPermission('modifier_un_evenement'), restrictByRole(), evenementController.updateEvenement.bind(evenementController));
  app.delete('/evenements/:id', authMiddleware, checkPermission('supprimer_un_evenement'), restrictByRole(), evenementController.deleteEvenement.bind(evenementController));

  // ====================== AGENCES ======================
  app.get('/agences', authMiddleware, checkPermission('voir_les_agences'), restrictByRole(), agenceController.getAllAgences.bind(agenceController));
  app.get('/agences/:id', authMiddleware, checkPermission('voir_une_agence'), restrictByRole(), agenceController.getAgenceById.bind(agenceController));
  app.post('/agences', authMiddleware, checkPermission('creer_une_agence'), restrictByRole(), agenceController.createAgence.bind(agenceController));
  app.put('/agences/:id', authMiddleware, checkPermission('modifier_une_agence'), restrictByRole(), agenceController.updateAgence.bind(agenceController));
  app.delete('/agences/:id', authMiddleware, checkPermission('supprimer_une_agence'), restrictByRole(), agenceController.deleteAgence.bind(agenceController));

  // ====================== POSTES ======================
  app.get('/postes', authMiddleware, checkPermission('voir_les_postes'), restrictByRole(), posteController.getAll.bind(posteController));
  app.get('/postes/:id', authMiddleware, checkPermission('voir_un_poste'), restrictByRole(), posteController.getById.bind(posteController));
  app.post('/postes', authMiddleware, checkPermission('creer_un_poste'), restrictByRole(), posteController.create.bind(posteController));
  app.put('/postes/:id', authMiddleware, checkPermission('modifier_un_poste'), restrictByRole(), posteController.update.bind(posteController));
  app.delete('/postes/:id', authMiddleware, checkPermission('supprimer_un_poste'), restrictByRole(), posteController.delete.bind(posteController));
};
