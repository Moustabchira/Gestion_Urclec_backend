import { Express } from "express";
import prismaClient from "../utils/prismaClient";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";
import RoleController from "../controllers/RoleController";
import PermissionController from "../controllers/PermissionController";
import DemandePermissionController from "../controllers/DemandePermissionController";
import DemandeController from "../controllers/DemandeController";
import CongeController from "../controllers/CongeController";
import AbsenceController from "../controllers/AbsenceController";
import EvenementController from "../controllers/EvenementController";
import AgenceController from "../controllers/AgenceController";
import PosteController from "../controllers/PosteController";
import EquipementController from "../controllers/EquipementController";
import AffectationController from "../controllers/AffectationController";
import ActionController from "../controllers/ActionCreditController";
import PointServiceController from "../controllers/PointServiceController";
import CreditController from "../controllers/creditController";
import ActionCreditController from "../controllers/ActionCreditController";
import upload from "../utils/configMulter";

import { authMiddleware } from "../middlewares/AuthMiddleware";
import { checkPermission } from "../middlewares/checkPermission";
import { restrictByRole } from "../middlewares/RoleMiddleware";

const authController = new AuthController();
const userController = new UserController();
const roleController = new RoleController();
const permissionController = new PermissionController();
const demandePermissionController = new DemandePermissionController();
const demandeController = new DemandeController();
const congeController = new CongeController();
const absenceController = new AbsenceController();
const evenementController = new EvenementController();
const agenceController = new AgenceController();
const posteController = new PosteController();
const equipementController = new EquipementController();
const affectationController = new AffectationController();
const actionController = new ActionController();
const pointServiceController = new PointServiceController();
const creditController = new CreditController();
const actionCreditController = new ActionCreditController();

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
  app.get('/users', userController.getAllUsers.bind(userController));
  app.get('/users/:id', userController.getUserById.bind(userController));
  app.post('/users', userController.createUser.bind(userController));
  app.put('/users/:id', userController.updateUser.bind(userController));
  app.delete('/users/:id', userController.deleteUser.bind(userController));
  app.post('/users/:userId/roles/:roleId', userController.assignRoleToUser.bind(userController));
  app.delete('/users/:userId/roles/:roleId', userController.removeRoleFromUser.bind(userController));
  app.post('/users/:userId/chef/:chefId', userController.assignChefToUser.bind(userController));
  app.get('/users/agence/:agenceId', userController.getUsersByAgence.bind(userController));

  
  // ====================== ROLES ======================
  app.get('/roles', roleController.getRoles.bind(roleController));
  app.get('/roles/:id', roleController.getRoleById.bind(roleController));
  app.post('/roles', roleController.createRole.bind(roleController));
  app.put('/roles/:id', roleController.updateRole.bind(roleController));
  app.delete('/roles/:id', roleController.deleteRole.bind(roleController));
  app.post('/roles/:roleId/permissions', roleController.assignPermissionToRole.bind(roleController));
  app.delete('/roles/:roleId/permissions', roleController.removePermissionFromRole.bind(roleController)); 

  // ====================== PERMISSIONS ======================
  app.get('/permissions', permissionController.getPermissions.bind(permissionController));
  app.get('/permissions/:id', permissionController.getPermissionById.bind(permissionController));
  app.delete('/permissions/:id', permissionController.deletePermission.bind(permissionController));

  // ====================== DEMANDES ======================
  app.get('/demandes', demandeController.getAll.bind(demandeController));
  app.get('/demandes/:id', demandeController.getOne.bind(demandeController));
  app.post('/demandes', demandeController.create.bind(demandeController));
  app.put('/demandes/:id', demandeController.update.bind(demandeController));
  app.delete('/demandes/:id', demandeController.delete.bind(demandeController));
  app.post('/demandes/:demandeId/decisions', demandeController.prendreDecision.bind(demandeController));
  app.get('/demandes/:id/pdf', demandeController.generatePdf.bind(demandeController));
  
  // ======================= AGENCES =======================
  app.get('/agences', agenceController.getAllAgences.bind(agenceController));
  app.get('/agences/:id', agenceController.getAgenceById.bind(agenceController));
  app.post('/agences', agenceController.createAgence.bind(agenceController));
  app.put('/agences/:id', agenceController.updateAgence.bind(agenceController));
  app.delete('/agences/:id', agenceController.deleteAgence.bind(agenceController));

  // ======================= POSTES ========================
  app.get('/postes', posteController.getAll.bind(posteController));
  app.get('/postes/:id', posteController.getById.bind(posteController));
  app.post('/postes', posteController.create.bind(posteController));
  app.put('/postes/:id', posteController.update.bind(posteController));
  app.delete('/postes/:id', posteController.delete.bind(posteController));

  // ======================= CONGES ========================
  app.get('/conges', congeController.getAll.bind(congeController));
  app.get('/conges/:id', congeController.getOne.bind(congeController));

  // ======================= ABSENCES =======================
  app.get('/absences', absenceController.getAllAbsences.bind(absenceController));
  app.get('/absences/:id', absenceController.getAbsenceById.bind(absenceController));

  // ======================= DEMANDEPERMISSIONS ==============
  app.get('/demandepermissions', demandePermissionController.getAllPermissions.bind(demandePermissionController));
  app.get('/demandepermissions/:id', demandePermissionController.getPermissionsById.bind(demandePermissionController));

  // ======================= EVENEMENTS =====================
  app.get('/evenements', evenementController.getAllEvenements.bind(evenementController));
  app.get('/evenements/:id', evenementController.getEvenementById.bind(evenementController));
  app.post('/evenements', upload.array('images'), evenementController.createEvenement.bind(evenementController));
  app.put('/evenements/:id', upload.array('images'), evenementController.updateEvenement.bind(evenementController));
  app.delete('/evenements/:id', evenementController.deleteEvenement.bind(evenementController)); 
  app.put('/evenements/:id/statut', evenementController.changeStatut.bind(evenementController));

 
  // ======================= POINTS DE SERVICE =====================
  app.post('/points-de-service', pointServiceController.create.bind(pointServiceController));
  app.get('/points-de-service', pointServiceController.getAll.bind(pointServiceController));
  app.get('/points-de-service/:id', pointServiceController.getById.bind(pointServiceController));
  app.put('/points-de-service/:id', pointServiceController.update.bind(pointServiceController));
  app.delete('/points-de-service/:id', pointServiceController.delete.bind(pointServiceController));
  


  // ======================= EQUIPEMENTS =====================
  app.post('/equipements', upload.array('images'), equipementController.create.bind(equipementController));
  app.get('/equipements', equipementController.getAll.bind(equipementController));
  app.get('/equipements/:id', equipementController.getById.bind(equipementController));
  app.put('/equipements/:id', upload.array('images'), equipementController.update.bind(equipementController));
  app.delete('/equipements/:id', equipementController.archive.bind(equipementController));
  app.put('/equipements/:id/status', equipementController.declarerStatus.bind(equipementController));


  // ======================= AFFECTATIONS =====================
  app.post('/affectations', affectationController.affecter.bind(affectationController));
  app.put('/affectations/:id/status', affectationController.changerStatus.bind(affectationController));
  app.put('/affectations/:id/retrait', affectationController.retirer.bind(affectationController));
  app.get('/affectations/en-cours', affectationController.enCours.bind(affectationController));
  app.get('/affectations/historique', affectationController.historique.bind(affectationController));
  app.get('/affectations/historique/pdf', affectationController.historiquePDF.bind(affectationController));

  
  // ======================= CREDITS =====================
  app.get('/credits', creditController.getAll.bind(creditController));
  app.get('/credits/:id', creditController.getOne.bind(creditController));
  app.post('/credits', creditController.create.bind(creditController));
  app.put('/credits/:id', creditController.update.bind(creditController));
  app.delete('/credits/:id', creditController.archive.bind(creditController));

  // ======================= ACTIONS DE CREDITS =====================
  app.get('/credits/:creditId/actions', actionCreditController.getByCredit.bind(actionCreditController));
  app.post('/actions', actionCreditController.create.bind(actionCreditController));
  app.put('/actions/:id', actionCreditController.update.bind(actionCreditController));
  app.delete('/actions/:id', actionCreditController.delete.bind(actionCreditController));
  app.put('/actions/:id/archive', actionCreditController.archive.bind(actionCreditController));
  
}