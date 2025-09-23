import prismaClient from "../utils/prismaClient";
import { Conge } from "../types/index";


export default class CongeService {

    public async getAllConges(): Promise<Conge[]> {
        return await prismaClient.conge.findMany();
    }

    public async getCongeById(id: number): Promise<Conge | null> {
        return await prismaClient.conge.findUnique({
            where: { id },
        });
    }

}