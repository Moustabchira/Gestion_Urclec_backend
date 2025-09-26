import prismaClient from "../utils/prismaClient";
import { Absence } from "../types/index";

interface GetAllAbsencesFilters {
  userId?: number;
  justification?: string;
  dateDebut?: string;
  dateFin?: string;
}

export default class AbsenceService {

  // Récupérer toutes les absences avec pagination et filtrage
  public async getAllAbsences(
    page = 1,
    limit = 10,
    filters?: GetAllAbsencesFilters
  ): Promise<{ data: Absence[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters) {
      if (filters.userId) where.demande = { userId: filters.userId };
      if (filters.justification) where.justification = { contains: filters.justification, mode: 'insensitive' };
      if (filters.dateDebut) where.demande = { ...where.demande, dateDebut: new Date(filters.dateDebut) };
      if (filters.dateFin) where.demande = { ...where.demande, dateFin: new Date(filters.dateFin) };
    }

    const [data, total] = await Promise.all([
      prismaClient.absence.findMany({
        skip,
        take: limit,
        where,
        include: { 
          demande: { 
            include: { conge: true, absence: true, demandePermission: true, decisions: true } 
          } 
        },
      }),
      prismaClient.absence.count({ where }),
    ]);

    return { data, total };
  }

  // Récupérer une absence par ID
  public async getAbsenceById(id: number): Promise<Absence | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID d'absence invalide");

    return prismaClient.absence.findUnique({
      where: { id },
      include: { 
        demande: { 
          include: { conge: true, absence: true, demandePermission: true, decisions: true } 
        } 
      },
    });
  }
}
