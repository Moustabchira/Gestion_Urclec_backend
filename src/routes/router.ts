import { Express } from "express";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";
import RoleController from "../controllers/RoleController";
import PermissionController from "../controllers/PermissionController";
import DemandeController from "../controllers/DemandeController";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import CongeController from "../controllers/CongeController";
import PermissionsController from "../controllers/PermissionsController";
import AbsenceController from "../controllers/AbsenceController";
import EvenementController from "../controllers/EvenementController";
import AgenceController from "../controllers/AgenceController";


const authController = new AuthController();
const userController = new UserController();
const roleController = new RoleController();
const permissionController = new PermissionController();
const demandeController = new DemandeController();
const congeController = new CongeController();
const permissionsController = new PermissionsController();
const absenceController = new AbsenceController();
const evenementController = new EvenementController();
const agenceController = new AgenceController();



export default (app: Express) : void => {

    //inscription
    app.post('/register', authController.register.bind(authController));

    //connexion
    app.post('/login', authController.login.bind(authController));


    //users
    app.get('/users', authMiddleware, userController.getAllUsers.bind(userController));
    app.get('/users/:id', userController.getUserById.bind(userController));
    app.put('/users/:id', userController.updateUser.bind(userController));
    app.delete('/users/:id', userController.deleteUser.bind(userController));
    app.post('/users/:userId/roles/:roleId', userController.assignRoleToUser.bind(userController));
    app.delete('/users/:userId/roles/:roleId', userController.removeRoleFromUser.bind(userController));


    //roles
    app.get('/roles', roleController.getRoles.bind(roleController));
    app.post('/roles', roleController.createRole.bind(roleController));
    app.get('/roles/:id', roleController.getRoleById.bind(roleController));
    app.put('/roles/:id', roleController.updateRole.bind(roleController));
    app.delete('/roles/:id', roleController.deleteRole.bind(roleController));
    app.post('/roles/:roleId/permissions', roleController.assignPermissionToRole.bind(roleController));
    app.delete('/roles/:roleId/permissions', roleController.removePermissionFromRole.bind(roleController));


    //permissions
    app.get('/permission', permissionController.getPermissions.bind(permissionController));
    app.get('/permission/:id', permissionController.getPermissionById.bind(permissionController));
    app.put('/permission/:id', permissionController.updatePermission.bind(permissionController));
    app.delete('/permission/:id', permissionController.deletePermission.bind(permissionController));


    //demandes
    app.post('/demandes', demandeController.create.bind(demandeController));
    app.get('/demandes', demandeController.getAll.bind(demandeController));
    app.get('/demandes/:id', demandeController.getOne.bind(demandeController));
    app.put('/demandes/:id', demandeController.update.bind(demandeController));
    app.delete('/demandes/:id', demandeController.delete.bind(demandeController));


    //congés
    app.get('/conges', congeController.getAll.bind(congeController));
    app.get('/conges/:id', congeController.getOne.bind(congeController));


    //les permissions demandées
    app.get('/permissions', permissionsController.getAllPermissions.bind(permissionsController));
    app.get('/permissions/:id', permissionsController.getPermissionsById.bind(permissionsController));


    //absences
    app.get('/absences', absenceController.getAllAbsences.bind(absenceController));
    app.get('/absences/:id', absenceController.getAbsenceById.bind(absenceController));

    //evenements
    app.get('/evenements', evenementController.getAllEvenements.bind(evenementController));
    app.get('/evenements/:id', evenementController.getEvenementById.bind(evenementController));
    app.post('/evenements', evenementController.createEvenement.bind(evenementController));
    app.put('/evenements/:id', evenementController.updateEvenement.bind(evenementController));
    app.delete('/evenements/:id', evenementController.deleteEvenement.bind(evenementController));


    //agences
    app.get('/agences', agenceController.getAllAgences.bind(agenceController));
    app.get('/agences/:id', agenceController.getAgenceById.bind(agenceController));
    app.post('/agences', agenceController.createAgence.bind(agenceController));
    app.put('/agences/:id', agenceController.updateAgence.bind(agenceController));
    app.delete('/agences/:id', agenceController.deleteAgence.bind(agenceController));

}
