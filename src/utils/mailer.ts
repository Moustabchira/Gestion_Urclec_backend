import nodemailer from "nodemailer";

// Vérifie que les variables d'environnement sont présentes
const { SMTP_USER, SMTP_PASS } = process.env;
if (!SMTP_USER || !SMTP_PASS) {
  throw new Error("Veuillez définir SMTP_USER et SMTP_PASS dans le .env");
}

// Création du transporteur
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS, // mot de passe d'application Gmail
  },
});

/**
 * sendMail - envoie un email
 * @param to destinataire
 * @param subject sujet du mail
 * @param text contenu en texte brut
 */
export const sendMail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"URCLEC App" <${SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log("Mail envoyé:", info.response);
  } catch (err) {
    console.error("Erreur envoi mail:", err);
  }
};
