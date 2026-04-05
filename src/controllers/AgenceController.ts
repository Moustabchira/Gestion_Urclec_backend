import { Request, Response } from "express";
import AgenceService from "../services/AgenceService";
import * as status from "../utils/constantes";

const agenceService = new AgenceService();

export default class AgenceController {

  private parseId(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw {
        type: "validation",
        errors: { id: "ID Agence invalide" },
      };
    }
    return id;
  }

  // ========================= GET ALL =========================
  public async getAllAgences(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        nom_agence: req.query.nom_agence as string,
        code_agence: req.query.code_agence as string,
        ville: req.query.ville as string,
      };

      const result = await agenceService.getAllAgences(page, limit, filters);

      return res.status(status.HTTP_STATUS_OK).json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page,
          lastPage: Math.ceil(result.total / limit),
        },
      });

    } catch (error: any) {

      if (error.type === "validation") {
        return res.status(status.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Erreur de validation",
          errors: error.errors,
        });
      }

      return res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  // ========================= GET BY ID =========================
  public async getAgenceById(req: Request, res: Response) {
    try {
      const id = this.parseId(req.params.id);
      const agence = await agenceService.getAgenceById(id);

      return res.status(status.HTTP_STATUS_OK).json({
        success: true,
        data: agence,
      });

    } catch (error: any) {

      if (error.type === "validation") {
        return res.status(status.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Erreur de validation",
          errors: error.errors,
        });
      }

      return res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  // ========================= CREATE =========================
  public async createAgence(req: Request, res: Response) {
    try {
      const agence = await agenceService.createAgence(req.body);

      return res.status(status.HTTP_STATUS_CREATED).json({
        success: true,
        data: agence,
      });

    } catch (error: any) {

      if (error.type === "validation") {
        return res.status(status.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Erreur de validation",
          errors: error.errors,
        });
      }

      return res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  // ========================= UPDATE =========================
  public async updateAgence(req: Request, res: Response) {
    try {
      const id = this.parseId(req.params.id);
      const updatedAgence = await agenceService.updateAgence(id, req.body);

      return res.status(status.HTTP_STATUS_OK).json({
        success: true,
        data: updatedAgence,
      });

    } catch (error: any) {

      if (error.type === "validation") {
        return res.status(status.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Erreur de validation",
          errors: error.errors,
        });
      }

      return res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  // ========================= DELETE =========================
  public async deleteAgence(req: Request, res: Response) {
    try {
      const id = this.parseId(req.params.id);
      const deletedAgence = await agenceService.deleteAgence(id);

      return res.status(status.HTTP_STATUS_OK).json({
        success: true,
        data: deletedAgence,
      });

    } catch (error: any) {

      if (error.type === "validation") {
        return res.status(status.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Erreur de validation",
          errors: error.errors,
        });
      }

      return res.status(status.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }
}