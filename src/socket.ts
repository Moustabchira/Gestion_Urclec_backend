import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 User connecté :", socket.id);

    socket.on("join", (userId: number) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} rejoint sa room`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User déconnecté :", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket non initialisé");
  return io;
};