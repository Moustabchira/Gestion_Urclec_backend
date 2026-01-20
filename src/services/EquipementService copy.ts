import prismaClient from "../utils/prismaClient";
import { createEquipementSchema, updateEquipementSchema } from "../validations/equipementSchema";
import MouvementService from "./MouvementService";
import { sendMail } from "../utils/mailer";

export default class EquipementService {
  private mouvementService = new MouvementService();

  // ----------------- CRUD Équipement -----------------
  async createEquipement(data: any) {
    const validated = createEquipementSchema.parse(data);
    return prismaClient.equipement.create({
      data: {
        ...validated,
        images: validated.images ? JSON.stringify(validated.images) : null,
      },
    });
  }

  async getAllEquipements() {
    const list = await prismaClient.equipement.findMany({
      where: { archive: false },
      orderBy: { createdAt: "desc" },
      include: {
        responsableActuel: true,
        pointServiceActuel: true,
        agenceActuelle: true,
      },
    });

    return list.map(eq => ({
      ...eq,
      images: eq.images ? JSON.parse(eq.images) : [],
    }));
  }



  async getEquipementById(id: number) {
    const eq = await prismaClient.equipement.findUnique({
      where: { id },
      include: { mouvements: true },
    });
    if (!eq) return null;
    return { ...eq, images: eq.images ? JSON.parse(eq.images) : [] };
  }

  async updateEquipement(id: number, data: any) {
    const validated = updateEquipementSchema.parse(data);
    return prismaClient.equipement.update({
      where: { id },
      data: { ...validated, images: validated.images ? JSON.stringify(validated.images) : undefined },
    });
  }

  async archiveEquipement(id: number) {
    return prismaClient.equipement.update({
      where: { id },
      data: { archive: true, archivedAt: new Date() },
    });
  }

  // ----------------- Déclaration état / statut -----------------
  async declarerEtatEquipement(
    id: number,
    etat: "FONCTIONNEL" | "EN_PANNE" | "EN_REPARATION" | "HORS_SERVICE" | "EN_TRANSIT"
  ) {
    const eq = await prismaClient.equipement.findUnique({ where: { id } });
    if (!eq) throw new Error("Équipement introuvable");

    // ❌ Interdictions
    if (eq.etat === "EN_REPARATION" && etat === "EN_TRANSIT") {
      throw new Error("Impossible : équipement en réparation");
    }

    let status = eq.status;

    if (["EN_REPARATION", "EN_PANNE", "EN_TRANSIT", "HORS_SERVICE"].includes(etat)) {
      status = "INDISPONIBLE";
    }

    if (etat === "FONCTIONNEL" && eq.responsableActuelId) {
      status = "ASSIGNE";
    }

    if (etat === "FONCTIONNEL" && !eq.responsableActuelId) {
      status = "DISPONIBLE";
    }

    return prismaClient.equipement.update({
      where: { id },
      data: { etat, status },
    });
  }


  async declarerStatusEquipement(id: number, status: "DISPONIBLE" | "ASSIGNE" | "INDISPONIBLE") {
    return prismaClient.equipement.update({ where: { id }, data: { status } });
  }

  // ----------------- Affectation -----------------
  async affecterEquipement(data: {
    equipementId: number;
    initiateurId: number;
    employeId: number;
    pointServiceDestId?: number;
  }) {

    const equipement = await prismaClient.equipement.findUnique({
        where: { id: data.equipementId },
      });

      if (!equipement) throw new Error("Équipement introuvable");

      if (equipement.etat !== "FONCTIONNEL") {
        throw new Error("Équipement non fonctionnel");
     }


    // Créer le mouvement
    const mouvement = await this.mouvementService.createMouvement({
      type: "AFFECTATION",
      equipementId: data.equipementId,
      initiateurId: data.initiateurId,
      responsableDestinationId: data.employeId,
      pointServiceDestinationId: data.pointServiceDestId,
      etatAvant: "FONCTIONNEL",
      etatApres: "FONCTIONNEL",
    });

    // Mettre l’équipement en transit
    await prismaClient.equipement.update({
        where: { id: data.equipementId },
        data: {
          etat: "FONCTIONNEL",
          status: "ASSIGNE",
          responsableActuelId: data.employeId,
          pointServiceActuelId: data.pointServiceDestId ?? null,
        }
      });

    // Notification et mail
    await this.notifyUser(
      data.employeId,
      "Nouvel équipement assigné",
      `Un équipement (ID: ${data.equipementId}) vous a été assigné.`,
      "AFFECTATION",
      data.equipementId,
      mouvement.id
    );

    return mouvement;
  }

  // ----------------- Transfert -----------------
  async transfererEquipement(data: {
    equipementId: number;
    initiateurId: number;
    agenceSourceId?: number;
    agenceDestinationId?: number;
    pointServiceSourceId?: number;
    pointServiceDestId?: number;
    responsableDestinationId?: number;
  }) {

    const equipement = await prismaClient.equipement.findUnique({
      where: { id: data.equipementId },
    });

    if (!equipement) throw new Error("Équipement introuvable");

   if (!["FONCTIONNEL"].includes(equipement.etat)) {
      throw new Error("Transfert impossible dans cet état");
    }


    const mouvement = await this.mouvementService.createMouvement({
      type: "TRANSFERT",
      equipementId: data.equipementId,
      initiateurId: data.initiateurId,
      agenceSourceId: data.agenceSourceId,
      agenceDestinationId: data.agenceDestinationId,
      pointServiceSourceId: data.pointServiceSourceId,
      pointServiceDestinationId: data.pointServiceDestId,
      responsableDestinationId: data.responsableDestinationId,
      etatAvant: "FONCTIONNEL",
      etatApres: "EN_TRANSIT",
    });

    await this.declarerEtatEquipement(data.equipementId, "EN_TRANSIT");

    if (data.responsableDestinationId) {
      await this.notifyUser(
        data.responsableDestinationId,
        "Transfert d'équipement",
        `Un équipement (ID: ${data.equipementId}) est en transfert vers vous.`,
        "TRANSFERT",
        data.equipementId,
        mouvement.id
      );
    }

    return mouvement;
  }


  // ----------------- Envoi en réparation -----------------
async envoyerEnReparation(data: {
  equipementId: number;
  initiateurId: number;
  reparateurId: number;
  agenceSourceId?: number;
  pointServiceSourceId?: number;
  descriptionPanne: string;
}) {
  const equipement = await prismaClient.equipement.findUnique({
    where: { id: data.equipementId },
  });
  if (!equipement) throw new Error(`Équipement avec ID ${data.equipementId} introuvable`);
  if (!["EN_PANNE", "FONCTIONNEL"].includes(equipement.etat)) {
    throw new Error("Équipement non éligible à la réparation");
  }

  const reparateur = await prismaClient.user.findUnique({
    where: { id: data.reparateurId },
  });
  if (!reparateur) throw new Error(`Réparateur avec ID ${data.reparateurId} introuvable`);

  const mouvement = await this.mouvementService.createMouvement({
    type: "REPARATION",
    equipementId: data.equipementId,
    initiateurId: data.initiateurId,
    responsableDestinationId: data.reparateurId,
    agenceSourceId: data.agenceSourceId,
    pointServiceSourceId: data.pointServiceSourceId,
    etatAvant: equipement.etat,
    etatApres: "EN_REPARATION",
    commentaire: data.descriptionPanne, // 🔑 ici
  });

  await prismaClient.equipement.update({
    where: { id: data.equipementId },
    data: { etat: "EN_REPARATION", status: "INDISPONIBLE" },
  });

  await this.notifyUser(
    data.reparateurId,
    "Équipement en réparation",
    `Un équipement (ID ${data.equipementId}) vous a été confié pour réparation.`,
    "REPARATION",
    data.equipementId,
    mouvement.id
  );

  return mouvement;
}

 

async retourDeReparation(data: {
  mouvementId: number;       // mouvement REPARATION
  initiateurId: number;      // réparateur
  etatFinal: "FONCTIONNEL" | "EN_PANNE";
}) {

  if (!["FONCTIONNEL", "EN_PANNE"].includes(data.etatFinal)) {
    throw new Error("etatFinal invalide");
  }


  const reparation = await this.mouvementService.getMouvementById(data.mouvementId);

  if (!reparation || reparation.type !== "REPARATION") {
    throw new Error("Mouvement de réparation invalide");
  }

  // 🔐 La réparation doit être confirmée AVANT
  if (!reparation.confirme) {
    throw new Error("La réception par le réparateur n’a pas encore été confirmée");
  }

  if (reparation.responsableDestinationId !== data.initiateurId) {
    throw new Error("Seul le réparateur peut retourner l’équipement");
  }

  const equipement = reparation.equipement;


  const retour = await this.mouvementService.createMouvement({
    type: "RETOUR_REPARATION",
    equipementId: equipement.id,
    initiateurId: data.initiateurId, // réparateur
    agenceDestinationId: reparation.agenceSourceId,
    etatAvant: "EN_REPARATION",
    etatApres: data.etatFinal,
    commentaire: `REPARATION_ID:${reparation.id}`, // 🔑 TRÈS IMPORTANT
  });



  // 🔄 Équipement en transit
  await prismaClient.equipement.update({
    where: { id: equipement.id },
    data: {
      etat: "EN_TRANSIT",
      status: "INDISPONIBLE",
    },
  });

  return retour;
}



  // ----------------- Confirmation de réception -----------------
async confirmerReception(mouvementId: number, confirmeParId: number) {

  const mouvement = await this.mouvementService.getMouvementById(mouvementId);
  if (!mouvement) throw new Error("Mouvement introuvable");

  if (mouvement.confirme) {
    throw new Error("Réception déjà confirmée");
  }


 // ✅ Réception d’un équipement en réparation (par le réparateur)
  if (mouvement.type === "REPARATION") {
    if (mouvement.responsableDestinationId !== confirmeParId) {
      throw new Error("Seul le réparateur peut confirmer la réception");
    }

    return this.mouvementService.confirmerMouvement(
      mouvementId,
      confirmeParId
    );
  }


  // 🔐 Cas RETOUR DE RÉPARATION
  if (mouvement.type === "RETOUR_REPARATION") {

    const reparation = await prismaClient.mouvementEquipement.findFirst({
      where: {
        equipementId: mouvement.equipementId,
        type: "REPARATION",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!reparation || reparation.initiateurId !== confirmeParId) {
      throw new Error("Seul l’initiateur de la réparation peut confirmer le retour");
    }
  }

  const mouvementConfirme =
  await this.mouvementService.confirmerMouvement(mouvementId, confirmeParId);


  const updateData: any = {
    etat: "FONCTIONNEL",
    status: mouvement.responsableDestination ? "ASSIGNE" : "DISPONIBLE",

    agenceActuelleId: null,
    pointServiceActuelId: null,
    responsableActuelId: null,
  };

  // ✅ Destination RESPONSABLE
  if (mouvement.responsableDestination) {
    updateData.responsableActuelId = mouvement.responsableDestination.id;

    if (mouvement.pointServiceDestination) {
      updateData.pointServiceActuelId =
        mouvement.pointServiceDestination.id;
    }
  }

  // ✅ Destination POINT DE SERVICE
  else if (mouvement.pointServiceDestination) {
    updateData.pointServiceActuelId =
      mouvement.pointServiceDestination.id;
  }

  // ✅ Destination AGENCE
  else if (mouvement.agenceDestination) {
    updateData.agenceActuelleId = mouvement.agenceDestination.id;
  }

  // ✅ CAS RETRAIT
  if (mouvement.type === "RETRAIT") {
    updateData.etat = "HORS_SERVICE";
    updateData.status = "DISPONIBLE";
  }

  if (mouvement.type === "RETOUR_REPARATION") {

  // 🔐 Seul celui qui a envoyé en réparation peut confirmer le retour
  const reparation = await prismaClient.mouvementEquipement.findFirst({
    where: {
      equipementId: mouvement.equipementId,
      type: "REPARATION",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!reparation || reparation.initiateurId !== confirmeParId) {
    throw new Error("Seul l’initiateur de la réparation peut confirmer le retour");
  }

  updateData.etat = mouvement.etatApres;
  updateData.status =
    mouvement.etatApres === "FONCTIONNEL" ? "DISPONIBLE" : "INDISPONIBLE";

  updateData.responsableActuelId = null;
}


  await prismaClient.equipement.update({
    where: { id: mouvement.equipementId },
    data: updateData,
  });

  await this.notifyUser(
    mouvement.initiateurId,
    "Réception confirmée",
    `L’équipement ${mouvement.equipementId} a bien été reçu.`,
    "CONFIRMATION",
    mouvement.equipementId,
    mouvementId
  );

  return mouvementConfirme;
}


  // ----------------- Historique des mouvements -----------------
  async getMouvementsEquipement(equipementId: number, filter?: any) {
    return this.mouvementService.getAllMouvements({ equipementId, ...filter });
  }

  // ----------------- Fonction utilitaire notifications + mails -----------------
  private async notifyUser(userId: number, titre: string, message: string, type: string, equipementId?: number, mouvementId?: number) {
    await prismaClient.notification.create({
      data: { userId, titre, message, type, equipementId, mouvementId },
    });

    const user = await prismaClient.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await sendMail(user.email, titre, message);
    }
  }
}
