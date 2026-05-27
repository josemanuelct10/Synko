import { prisma } from "../../infrastructure/database/prisma.client.js";

export const authRepository = {
    findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        });
    },

    findUserWithRolesByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            } 
        });
    },

    findRoleByName(name: string) {
        return prisma.role.findUnique({
            where: { name }
        });
    },

    createUserWithRole(input: { name: string, email: string, passwordHash: string, roleId: string }) {
        return prisma.user.create({
            data: {
                name: input.name,
                email: input.email,
                passwordHash: input.passwordHash,
                roles: {
                    create: {
                        roleId: input.roleId
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        })
    },

    findUserWithRolesById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });
    }


}