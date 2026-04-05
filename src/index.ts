import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import http from "http"; // ✅ IMPORTANT
import router from "./routes/router";
import { seedAdmin } from "./utils/seed/seed";
import { initSocket } from "./socket"; // ✅ IMPORT SOCKET

const PORT: number = parseInt(process.env.PORT || "3000", 10);
const app = express();

// 🔹 Middleware CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
    credentials: true,
  })
);

// 🔹 Middleware JSON
app.use(express.json() as any);

// 🔹 Définir __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "../uploads")) as any);
app.use("/public", express.static(path.join(__dirname, "../public")) as any);

// 🔹 Routes
router(app);

// 🔥🔥🔥 ICI LA CORRECTION
const server = http.createServer(app);

// 🔥 initialiser socket
initSocket(server);

// 🔹 Démarrage
server.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Serveur + Socket démarré sur le port ${PORT}`);
  await seedAdmin();
});