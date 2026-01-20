import prismaClient from "../utils/prismaClient.ts";

type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";

export default class NotificationService {

  // 🔔 Création notification interne
  async create(params: {
    userId: number;
    titre: string;
    message: string;
    type?: NotificationType;
    equipementId?: number;
    mouvementId?: number;
  }) {
    return prismaClient.notification.create({
      data: {
        userId: params.userId,
        titre: params.titre,
        message: params.message,
        type: params.type ?? "INFO",
        canal: "IN_APP",
        equipementId: params.equipementId,
        mouvementId: params.mouvementId,
        lu: false,
      },
    });
  }

  // 📥 Notifications utilisateur
  async getByUser(userId: number) {
    return prismaClient.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        equipement: true,
        mouvement: true,
      },
    });
  }

  // 🔔 Notifications non lues (badge)
  async countUnread(userId: number) {
    return prismaClient.notification.count({
      where: {
        userId,
        lu: false,
      },
    });
  }

  // 👁 Marquer comme lue
  async markAsRead(id: number) {
    return prismaClient.notification.update({
      where: { id },
      data: {
        lu: true,
        luAt: new Date(),
      },
    });
  }
}
