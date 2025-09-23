import prismaClient from "../utils/prismaClient";
import { Absence } from "../types/index";


export default class AbsenceService {

    public async getAllAbsences(): Promise<Absence[]> {
        return prismaClient.absence.findMany();
    }

    public async getAbsenceById(id: number): Promise<Absence | null> {
        return prismaClient.absence.findUnique({
            where: { id }
        });
    }

}