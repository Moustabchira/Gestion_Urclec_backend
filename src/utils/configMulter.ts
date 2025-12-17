import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ✅ Recréer __dirname en mode ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Dossier d'upload
const uploadDir = path.join(__dirname, "../../uploads");

// 🔹 Créer le dossier s’il n’existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🔹 Configuration du stockage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 🔹 Filtrer les fichiers autorisés
const fileFilter = (_req: any, file: any, cb: any) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont autorisées"));
  }
};

// 🔹 Initialiser Multer
const upload = multer({
  storage: storage,
  limits: { files: 10 },
  fileFilter: fileFilter,
});

export default upload;
