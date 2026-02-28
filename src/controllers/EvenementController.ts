import { Request, Response } from "express";
import EvenementService from "../services/EvenementService";
import * as status from "../utils/constantes";

const evenementService = new EvenementService();

export default class EvenementController {

  private parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Récupérer tous les événements
  // ------------------------------------------------------------------------------------
public async getAllEvenements(req: Request, res: Response): Promise<void> {
  try {
    const filters: any = {
      titre: req.query.titre ? String(req.query.titre) : undefined,
      description: req.query.description ? String(req.query.description) : undefined,
      archive:
        req.query.archive === "true" ? true :
        req.query.archive === "false" ? false :
        undefined,
    };

    const userRole = String(req.query.userRole || "").toUpperCase();
    if (userRole !== "DRH") {
      filters.statut = "PUBLIE";
    }

    // 🔹 Pagination depuis query params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await evenementService.getEvenements(filters, page, limit);

    res.status(status.HTTP_STATUS_OK).json(result);
  } catch (error) {
    res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      message: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
}

  // ------------------------------------------------------------------------------------
  // 🔹 Récupérer un événement par ID
  // ------------------------------------------------------------------------------------
  public async getEvenementById(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID d'événement invalide" });
      return;
    }

    try {
      const evenement = await evenementService.getEvenementById(id);
      if (!evenement) {
        res.status(status.HTTP_STATUS_NOT_FOUND).json({ message: "Événement non trouvé" });
        return;
      }

      const userRole = String(req.query.userRole || "").toUpperCase();

      if (userRole !== "DRH" && evenement.statut !== "PUBLIE") {
        res.status(status.HTTP_STATUS_FORBIDDEN).json({
          message: "Vous n'avez pas la permission d'accéder à cet événement"
        });
        return;
      }

      res.status(status.HTTP_STATUS_OK).json(evenement);

    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Créer un événement
  // ------------------------------------------------------------------------------------
  public async createEvenement(req: Request, res: Response): Promise<void> {
    const userRole = String(req.body.userRole || "").toUpperCase();

    if (userRole !== "DRH") {
      res.status(403).json({ message: "Permission refusée." });
      return;
    }

    try {
      const data: any = {
        titre: req.body.titre,
        description: req.body.description,
        userId: Number(req.body.userId),
        dateDebut: req.body.dateDebut ? new Date(req.body.dateDebut) : null,
        dateFin: req.body.dateFin ? new Date(req.body.dateFin) : null,
        archive: req.body.archive === "true",
        statut: "EN_ATTENTE",
        images: req.files ? (req.files as Express.Multer.File[]).map(f => f.filename) : [],
      };

      const newEvenement = await evenementService.createEvenement(data);
      res.status(201).json(newEvenement);

    } catch (error: any) {
      res.status(400).json({
        message: error.message || "Erreur lors de la création de l'événement",
      });
    }
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Modifier un événement
  // ------------------------------------------------------------------------------------
  public async updateEvenement(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });
      return;
    }

    const userRole = String(req.body.userRole || "").toUpperCase();

    if (userRole !== "DRH") {
      res.status(status.HTTP_STATUS_FORBIDDEN).json({ message: "Permission refusée" });
      return;
    }

    try {
      const data: any = {
        titre: req.body.titre,
        description: req.body.description,
        userId: req.body.userId ? Number(req.body.userId) : undefined,
        dateDebut: req.body.dateDebut ? new Date(req.body.dateDebut) : undefined,
        dateFin: req.body.dateFin ? new Date(req.body.dateFin) : undefined,
        archive:
          req.body.archive === "true" || req.body.archive === true
            ? true
            : req.body.archive === "false" || req.body.archive === false
            ? false
            : undefined,
      };

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        data.images = req.files.map(f => f.filename);
      }

      const updated = await evenementService.updateEvenement(id, data);
      res.status(200).json(updated);

    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Supprimer un événement
  // ------------------------------------------------------------------------------------
  public async deleteEvenement(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id);
    if (!id) {
      res.status(status.HTTP_STATUS_BAD_REQUEST).json({ message: "ID invalide" });
      return;
    }

    const userRole = String(req.query.userRole || "").toUpperCase();
    if (userRole !== "DRH") {
      res.status(status.HTTP_STATUS_FORBIDDEN).json({ message: "Permission refusée" });
      return;
    }

    try {
      await evenementService.deleteEvenement(id);
      res.status(status.HTTP_STATUS_OK).json({ message: "Événement supprimé avec succès" });

    } catch (error) {
      res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // ------------------------------------------------------------------------------------
  // 🔹 Changer le statut
  // ------------------------------------------------------------------------------------
  public async changeStatut(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const { statut, userId, userRole } = req.body;

    if (!id || !statut || !userId) {
      res.status(400).json({ message: "Paramètres manquants" });
      return;
    }

    if (String(userRole || "").toUpperCase() !== "DRH") {
      res.status(status.HTTP_STATUS_FORBIDDEN).json({
        message: "Permission refusée",
      });
      return;
    }

    try {
      const changed = await evenementService.changeStatut(id, statut, Number(userId));
      res.status(200).json(changed);

    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
