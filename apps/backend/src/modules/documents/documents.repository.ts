import { prisma } from "../../infrastructure/database/prisma.client.js";

export const documentRepository = {
    findManyByUserId(userId: string) {
        return prisma.document.findMany({
            where: {
                userId,
                status: {
                    not: "deleted"
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    },

    findByIdAndUserId(id: string, userId: string) {
        return prisma.document.findFirst({
            where: {
                id,
                userId,
                status: {
                    not: "deleted"
                }
            }
        });
    },

    softDeleteByIdAndUserId(id: string, userId: string) {
        return prisma.document.updateMany({
            where: {
                id,
                userId,
                status: {
                    not: "deleted"
                }
            },
            data: {
                status: "deleted"
            }
        });
    }
};