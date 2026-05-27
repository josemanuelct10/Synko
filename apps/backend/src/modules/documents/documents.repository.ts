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
    },

    create(input: { userId: string; originalName: string; storedName: string; mimeType: string; sizeBytes: bigint; storagePath: string;}) {
        return prisma.document.create({
            data: {
            userId: input.userId,
            originalName: input.originalName,
            storedName: input.storedName,
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            storagePath: input.storagePath,
            status: "uploaded"
            }
        });
    }
};