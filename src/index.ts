import express from "express"; // ✅ import compatible TS + ESM
import cors from "cors";
import dotenv from "dotenv";
dotenv.config()     
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/router";
import { seedAdmin } from "./utils/seed/seed";

const PORT: number = parseInt(process.env.PORT || "3000", 10);
const app = express();

// 🔹 Middleware CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ajoute PATCH et OPTIONS
    allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
    credentials: true,
  })
);

// 🔹 Middleware JSON
app.use(express.json() as any); // as any pour TypeScript

// 🔹 Définir __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Servir les fichiers statiques (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")) as any);
app.use("/public", express.static(path.join(__dirname, "../public")) as any);

// 🔹 Routes
router(app);

// 🔹 Démarrage serveur
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  await seedAdmin();
  console.log("Couper le serveur avec Ctrl+C");
});
