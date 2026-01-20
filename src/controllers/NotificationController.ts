import { Request, Response } from "express";
import NotificationService from "../services/NotificationService";

const service = new NotificationService();

export default class NotificationController {

  // 📥 Mes notifications
  async getMyNotifications(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const notifications = await service.getByUser(user.id);
      res.json(notifications);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // 🔔 Compteur non lues
  async getUnreadCount(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const count = await service.countUnread(user.id);
      res.json({ count });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // 👁 Marquer une notification comme lue
  async markAsRead(req: Request, res: Response) {
    try {
      const user = req.user;
      const notificationId = Number(req.params.id);

      if (!user) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "ID invalide" });
      }

      const notification = await service.markAsRead(notificationId);
      res.json(notification);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
}
