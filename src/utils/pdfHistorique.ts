// utils/pdfHistorique.ts
import PDFDocument from "pdfkit";
import { Response } from "express";
import fs from "fs";
import path from "path";

// Couleurs des status (texte)
const statusColors: Record<string, string> = {
  BON: "#22c55e",
  ABIME: "#eab308",
  PERDU: "#ef4444",
  RETIRE: "#9ca3af",
};

export function generateHistoriquePDF(data: any[], res: Response) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  // ===================== HEADERS =====================
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=historique_affectations.pdf");

  doc.pipe(res);

  // 🔹 Logo
  const logoPath = path.join(process.cwd(), "public", "urclec.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 30, { width: 80 });
  }

  // 🔹 Titre
  doc.fontSize(20).fillColor("#333").text("Suivi des équipements", 0, 50, { align: "center" });
  doc.moveDown(2);

  // ===================== TABLE =====================
  const tableTop = 120;
  const rowHeight = 25;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colCount = 7;
  const colWidth = pageWidth / colCount;

  const columns = [
    { label: "Équipement", width: colWidth },
    { label: "Employé", width: colWidth },
    { label: "Point Service", width: colWidth },
    { label: "Quantité", width: colWidth },
    { label: "Status", width: colWidth },
    { label: "Date Affectation", width: colWidth },
    { label: "Date Fin", width: colWidth },
  ];

  let y = tableTop;

  // 🔹 Header
  let x = doc.page.margins.left;
  doc.fontSize(12).fillColor("#000");
  columns.forEach(col => {
    doc.rect(x, y, col.width, rowHeight).fill("#f3e4f1").stroke();
    doc.fillColor("#000").text(col.label, x + 5, y + 7, { width: col.width - 10 });
    x += col.width;
  });
  y += rowHeight;

  // 🔹 Rows avec bordures et alternance de couleur
  data.forEach((a, index) => {
    x = doc.page.margins.left;
    const bgColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";

    columns.forEach((col, i) => {
      // Fond
      doc.rect(x, y, col.width, rowHeight).fill(bgColor).stroke();

      // Texte
      doc.fillColor("#000").fontSize(10);
      let text = "";
      switch (i) {
        case 0: text = a.equipement?.nom || "-"; break;
        case 1: text = a.employe ? `${a.employe.prenom} ${a.employe.nom}` : "-"; break;
        case 2: text = a.pointService?.nom || "-"; break;
        case 3: text = a.quantite?.toString() || "-"; break;
        case 4:
          text = a.status || "-";
          doc.fillColor(statusColors[a.status] || "#000");
          break;
        case 5: text = a.dateAffectation ? new Date(a.dateAffectation).toLocaleDateString() : "-"; break;
        case 6: text = a.dateFin ? new Date(a.dateFin).toLocaleDateString() : "-"; break;
      }

      doc.text(text, x + 5, y + 7, { width: col.width - 10 });
      doc.fillColor("#000"); // reset couleur
      x += col.width;
    });

    y += rowHeight;

    // Nouvelle page si nécessaire
    if (y > doc.page.height - 50) {
      doc.addPage();
      y = tableTop;

      // Réafficher header
      x = doc.page.margins.left;
      columns.forEach(col => {
        doc.rect(x, y, col.width, rowHeight).fill("#f3e4f1").stroke();
        doc.fillColor("#000").text(col.label, x + 5, y + 7, { width: col.width - 10 });
        x += col.width;
      });
      y += rowHeight;
    }
  });

  doc.end();
}
