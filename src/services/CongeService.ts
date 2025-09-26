import prismaClient from "../utils/prismaClient";
import { Conge } from "../types/index";

interface GetAllCongesFilters {
  userId?: number;
  nbJours?: number;
  dateDebut?: string;
  dateFin?: string;
}

export default class CongeService {

  // Récupérer tous les congés avec pagination et filtrage
  public async getAllConges(
    page = 1,
    limit = 10,
    filters?: GetAllCongesFilters
  ): Promise<{ data: Conge[]; total: number }> {
    const skip = (page - 1) * limit;

    // Construction dynamique du where
    const where: any = {};
    if (filters) {
      if (filters.userId) where.demande = { userId: filters.userId };
      if (filters.nbJours) where.nbJours = filters.nbJours;
      if (filters.dateDebut) where.demande = { ...where.demande, dateDebut: new Date(filters.dateDebut) };
      if (filters.dateFin) where.demande = { ...where.demande, dateFin: new Date(filters.dateFin) };
    }

    const [data, total] = await Promise.all([
      prismaClient.conge.findMany({
        skip,
        take: limit,
        where,
        include: { 
          demande: { 
            include: { conge: true, absence: true, demandePermission: true, decisions: true } 
          } 
        },
      }),
      prismaClient.conge.count({ where }),
    ]);

    return { data, total };
  }

  // Récupérer un congé par ID
  public async getCongeById(id: number): Promise<Conge | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID de congé invalide");

    return prismaClient.conge.findUnique({
      where: { id },
      include: { 
        demande: { 
          include: { conge: true, absence: true, demandePermission: true, decisions: true } 
        } 
      },
    });
  }
}
