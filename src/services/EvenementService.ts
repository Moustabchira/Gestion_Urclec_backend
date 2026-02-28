import prismaClient from "../utils/prismaClient";
import { Evenement } from "../types";

interface GetAllEvenementFilters { 
  titre?: string; 
  description?: string; 
  userId?: number; 
  archive?: boolean; 
  statut?: "EN_ATTENTE" | "PUBLIE"; 
}

export default class EvenementService {

  // 🔹 Récupérer tous les événements avec pagination
  public async getEvenements(
    filters?: GetAllEvenementFilters,
    page = 1,
    limit = 10
  ): Promise<{
    data: Evenement[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    // Pagination sécurisée
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters) {
      if (filters.titre) where.titre = { contains: filters.titre, mode: "insensitive" };
      if (filters.description) where.description = { contains: filters.description, mode: "insensitive" };
      if (filters.userId) where.userId = filters.userId;
      if (filters.archive !== undefined) where.archive = filters.archive;
      if (filters.statut) where.statut = filters.statut;
    }

    // 🔹 Récupérer données + total
    const [evenements, total] = await Promise.all([
      prismaClient.evenement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
      prismaClient.evenement.count({ where }),
    ]);

    // 🔹 Mapping sécurisé pour TypeScript
    const data: Evenement[] = evenements.map(ev => ({
      ...ev,
      images: ev.images ? JSON.parse(ev.images) : [],
      statut: ev.statut === "EN_ATTENTE" || ev.statut === "PUBLIE" ? ev.statut : "EN_ATTENTE", // cast sécurisé
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 🔹 Récupérer un événement par ID
  public async getEvenementById(id: number): Promise<Evenement | null> { 
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID d'événement invalide"); 

    const evenement = await prismaClient.evenement.findUnique({ 
      where: { id }, 
      include: { user: true },
    }); 

    if (!evenement) return null; 
    return {
      ...evenement,
      images: evenement.images ? JSON.parse(evenement.images) : [],
      statut: evenement.statut === "EN_ATTENTE" || evenement.statut === "PUBLIE" ? evenement.statut : "EN_ATTENTE",
    };
  }

  // 🔹 Créer un événement
  public async createEvenement(data: any): Promise<Evenement> { 
    const evenement = await prismaClient.evenement.create({ 
      data: {
        ...data,
        statut: "EN_ATTENTE",
        images: data.images ? JSON.stringify(data.images) : null,
      },
      include: { user: true },
    }); 
    
    return {
      ...evenement,
      images: evenement.images ? JSON.parse(evenement.images) : [],
      statut: "EN_ATTENTE",
    }; 
  }

  // 🔹 Mettre à jour un événement
  public async updateEvenement(id: number, data: any): Promise<Evenement> { 
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID d'événement invalide"); 

    const dataToUpdate: any = { ...data };
    dataToUpdate.statut = "EN_ATTENTE"; // statut forcé

    if (data.images !== undefined) dataToUpdate.images = data.images ? JSON.stringify(data.images) : null; 
    if (data.archive !== undefined) dataToUpdate.archivedAt = data.archive ? new Date() : null; 

    const updated = await prismaClient.evenement.update({ 
      where: { id }, 
      data: dataToUpdate, 
      include: { user: true }, 
    }); 

    return {
      ...updated,
      images: updated.images ? JSON.parse(updated.images) : [],
      statut: "EN_ATTENTE",
    }; 
  }

  // 🔹 Supprimer un événement
  public async deleteEvenement(id: number): Promise<void> { 
    if (!Number.isInteger(id) || id <= 0) throw new Error("ID d'événement invalide"); 

    const existing = await prismaClient.evenement.findUnique({ where: { id } });
    if (!existing) throw new Error("Événement non trouvé");

    await prismaClient.evenement.delete({ where: { id } });
  }

  // 🔹 Changer le statut
  public async changeStatut(
    id: number,
    statut: "EN_ATTENTE" | "PUBLIE",
    userId: number
  ): Promise<Evenement> { 
    const evenement = await prismaClient.evenement.findUnique({ where: { id } }); 
    if (!evenement) throw new Error("Événement introuvable"); 

    const dataToUpdate: any = { statut };
    if (statut === "PUBLIE") dataToUpdate.publishedBy = userId;

    const updated = await prismaClient.evenement.update({ 
      where: { id }, 
      data: dataToUpdate, 
      include: { user: true }, 
    }); 

    return {
      ...updated,
      images: updated.images ? JSON.parse(updated.images) : [],
      statut: statut, // cast sûr
    }; 
  }
}