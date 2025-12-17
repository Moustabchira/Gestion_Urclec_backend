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

  // 🔹 Récupérer tous les événements
  public async getEvenements(filters?: GetAllEvenementFilters): Promise<Evenement[]> { 
    const where: any = {}; 
    if (filters) { 
      if (filters.titre) where.titre = { contains: filters.titre, mode: "insensitive" }; 
      if (filters.description) where.description = { contains: filters.description, mode: "insensitive" }; 
      if (filters.userId) where.userId = filters.userId; 
      if (filters.archive !== undefined) where.archive = filters.archive; 
      if (filters.statut) where.statut = filters.statut; 
    } 
    
    const evenements = await prismaClient.evenement.findMany({ 
      where,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }); 
    
    return evenements.map(ev => ({
      ...ev,
      images: ev.images ? JSON.parse(ev.images) : [],
    })); 
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
    }; 
  }

 public async updateEvenement(id: number, data: any): Promise<Evenement> { 
  if (!Number.isInteger(id) || id <= 0) throw new Error("ID d'événement invalide"); 

  const dataToUpdate: any = { ...data };

  // Toujours mettre le statut à EN_ATTENTE lors d'une modification
  dataToUpdate.statut = "EN_ATTENTE";

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
  public async changeStatut(id: number, statut: "EN_ATTENTE" | "PUBLIE", userId: number): Promise<Evenement> { 
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
    }; 
  }
}
