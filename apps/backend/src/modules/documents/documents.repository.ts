import type { DocumentStatus } from "@prisma/client";
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
    },

    updateStatus(input: { documentId: string, userId: string, status: DocumentStatus, errorMessage?: string | null, processedAt?: Date | null }) {
        return prisma.document.update({
        where: {
            id: input.documentId,
            userId: input.userId
        },
        data: {
            status: input.status,
            errorMessage: input.errorMessage,
            processedAt: input.processedAt
        }
        });
    },
    
    createChunks(input: { documentId: string, userId: string, chunks: Array<{ chunkIndex: number, content: string, pageNumber: number | null, tokenCount: number}>}){
        return prisma.documentChunk.createMany({
            data: input.chunks.map((chunk) => ({
                documentId: input.documentId,
                userId: input.userId,
                chunkIndex: chunk.chunkIndex,
                content: chunk.content,
                pageNumber: chunk.pageNumber,
                tokenCount: chunk.tokenCount
            }))
        });
    },

    deleteChunksByDocumentId(documentId: string, userId: string) {
        return prisma.documentChunk.deleteMany({
            where: {
                documentId,
                userId
            }
        });
    }
};