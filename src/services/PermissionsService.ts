import prismaClient from "../utils/prismaClient";
import { Permission } from "../types/index";

export default class PermissionsService {

    public async getAllPermissions(): Promise<Permission[]> {
        return await prismaClient.permission.findMany();
    }

    public async getPermissionById(id: number): Promise<Permission | null> {
        return await prismaClient.permission.findUnique({
            where: { id },
        });
    }
}
