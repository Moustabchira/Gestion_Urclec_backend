import prisma from "../utils/prismaClient";
import { getIO } from "../socket";

export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";

export default class NotificationService {
  async create(params: {
    userId: number;
    titre: string;
    message: string;
    type?: NotificationType;
    equipementId?: number;
    mouvementId?: number;
  }) {
    const notification = await prisma.notification.create({
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

    try {
      const io = getIO();
      io.to(`user_${params.userId}`).emit("notification", notification);
    } catch {
      console.warn("⚠️ Socket non prêt");
    }

    return notification;
  }

  async getByUser(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { equipement: true, mouvement: true },
    });
  }

  async countUnread(userId: number) {
    return prisma.notification.count({ where: { userId, lu: false } });
  }

  async markAsRead(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { lu: true, luAt: new Date() },
    });
  }
}