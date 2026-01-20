import prismaClient from "./prismaClient.ts";
import NotificationService from "../services/NotificationService.ts";

const service = new NotificationService();

async function test() {
  try {
    const user = await prismaClient.user.findFirst();
    if (!user) {
      console.log("Aucun utilisateur");
      return;
    }

    const notif = await service.create({
      userId: user.id,
      titre: "Mouvement confirmé",
      message: "Le mouvement d’équipement a été validé",
      type: "SUCCESS",
    });

    console.log("Notification créée :", notif);

    const unread = await service.countUnread(user.id);
    console.log("Notifications non lues :", unread);

  } catch (err) {
    console.error(err);
  } finally {
    await prismaClient.$disconnect();
  }
}

test();
