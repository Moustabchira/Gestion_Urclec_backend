import prisma from "../utils/prismaClient";
import { Demande } from "../types";

interface DataDemande {
    type: "conge" | "absence" | "permission";
    dateDebut: string;
    dateFin: string;
    motif: string;
    userId?: number;
    status?: string;
    nbJours?: string; 
    justification?: string; 
    duree?: string; 
}

export default class DemandeService {

  public async createDemande(data: DataDemande ): Promise<Demande> {

      console.log("Payload envoyé à Prisma =>", JSON.stringify({
        type: data.type,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        motif: data.motif,
        userId: data.userId,
        status: data.status ?? "en attente",
        ...(data.type === "permission" && {
          demandePermission: {
            create: [{ duree: data.duree }]
          }
        })
      }, null, 2));


      const demande = await prisma.demande.create({

      data: {
          type: data.type,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin,
          motif: data.motif,
          userId: data.userId!,
          status: data.status ?? "en attente",
          ...(data.type === "conge" && {
            conge: {
              create: [{ nbJours: data.nbJours! }],
            },
          }),
          ...(data.type === "absence" && {
            absence: {
              create: [{ justification: data.justification! }],
            },
          }),
          ...(data.type === "permission" && {
            demandePermission: {
              create: [{ duree: data.duree! }],
            },
          }),
      } as any,
      
      include: { conge: true, absence: true, demandePermission: true, decisions: true },

    });

    return demande as Demande;
  }


  public async getAllDemandes(): Promise<Demande[]> {

    const demandes = await prisma.demande.findMany({
      include: { 
        conge: true, 
        absence: true, 
        demandePermission: true, 
        decisions: true 
      },
    });

    return demandes as Demande[];
  }


  public async getDemandeById(id: number): Promise<Demande | null> {

    const demande = await prisma.demande.findUnique({
      where: { id },
      include: { conge: true, absence: true, demandePermission: true, decisions: true },
    });

    return demande as Demande | null;
  
  }


  public async updateDemande(id: number, data: Partial<Demande>): Promise<Demande> {

    const updated = await prisma.demande.update({
      where: { id },
      data: {
        type: data.type,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        motif: data.motif,
        status: data.status,
      },
      include: { conge: true, absence: true, demandePermission: true },
    });

    return updated as Demande;
  }


  public async deleteDemande(id: number): Promise<void> {
    await prisma.demande.delete({ 
      where: { id } 
    });
  }

}
