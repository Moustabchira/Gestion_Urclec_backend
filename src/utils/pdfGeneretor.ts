// utils/pdfGenerator.ts
import PDFDocument from "pdfkit";
import { Response } from "express";
import fs from "fs";
import path from "path";
import { Demande } from "../types/index";

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
};

export const generateDemandePdf = (demande: Demande, res: Response) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Headers HTTP
  res.setHeader("Content-Disposition", `attachment; filename=demande_${demande.id}.pdf`);
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // Logo
  const logoPath = path.join(process.cwd(), "public", "urclec.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 80 });
  }

  // Titre centré
  doc.fontSize(22).fillColor("#111827").text(`Demande`, 0, 50, { align: "center" });
  doc.moveDown(2);

  // Informations principales alignées à gauche
  const startX = 50;
  doc.fontSize(12).fillColor("#111827");
  doc.text(`Employé : ${demande.user?.prenom} ${demande.user?.nom}`, startX);
  doc.text(`Type : ${demande.type.toUpperCase()}`, startX);
  doc.text(`Période : ${new Date(demande.dateDebut).toLocaleDateString("fr-FR")} - ${new Date(demande.dateFin).toLocaleDateString("fr-FR")}`, startX);
  doc.text(`Motif : ${demande.motif}`, startX);

  // Statut coloré
  doc.fillColor(statusColors[demande.status] || "#111827");
  doc.text(`Statut : ${demande.status}`, startX);
  doc.fillColor("#111827");

  if (demande.type === "conge" && demande.conge) {
    doc.text(`Nombre de jours : ${demande.conge.nbJours}`, startX);
  }
  if (demande.type === "permission" && demande.demandePermission) {
    doc.text(`Durée : ${demande.demandePermission.duree}`, startX);
  }
  if (demande.type === "absence" && demande.absence) {
    doc.text(`Justification : ${demande.absence.justification}`, startX);
  }

  doc.moveDown(1);

  // Décisions
  doc.fontSize(14).fillColor("#111827").text("Décisions :", startX, doc.y, { underline: true });
  doc.moveDown(0.5);

  if (demande.decisions && demande.decisions.length > 0) {
    const rowHeight = 20;
    let currentY = doc.y;

    // Header rose/grillé
    const headers = ["Niveau", "Décideur", "Statut"];
    const colWidths = [150, 200, 100];
    let x = startX;

    headers.forEach((header, i) => {
      doc.rect(x, currentY, colWidths[i], rowHeight).fill("#f3e4f1");
      doc.fillColor("#111827").text(header, x + 5, currentY + 5);
      x += colWidths[i];
    });

    currentY += rowHeight;

    // Lignes décisions
    demande.decisions.forEach(dec => {
      x = startX;

      // Niveau
      doc.fillColor("#111827").text(dec.niveau, x + 5, currentY + 5, { width: colWidths[0] - 10 });
      x += colWidths[0];

      // Décideur
      doc.text(`${dec.user?.prenom} ${dec.user?.nom}`, x + 5, currentY + 5, { width: colWidths[1] - 10 });
      x += colWidths[1];

      // Statut coloré
      doc.fillColor(statusColors[dec.status] || "#111827").text(dec.status, x + 5, currentY + 5, { width: colWidths[2] - 10 });
      currentY += rowHeight;
      doc.fillColor("#111827");

      // Nouvelle page si nécessaire
      if (currentY > doc.page.height - 50) {
        doc.addPage();
        currentY = 50;
      }
    });
  } else {
    doc.fontSize(12).text("Aucune décision disponible.", startX);
  }

  doc.end();
};
