import crypto from "node:crypto";

import { env } from "../../config/env.js";
import { embeddingsProvider } from "../../infrastructure/ai/mock-embeddings.provider.js";
import { ensureQdrantCollection } from "../../infrastructure/qdrant/qdrant.collection.js";
import { qdrantClient } from "../../infrastructure/qdrant/qdrant.client.js";
import { documentRepository } from "./documents.repository.js";

export const indexDocumentChunksInQdrant = async (input: { userId: string, documentId: string; source: string }): Promise<void> => {
    await ensureQdrantCollection();

    const chunks = await documentRepository.findChunksByDocumentId(input.documentId, input.userId);

    if (chunks.length === 0) return;

    const embeddings = await embeddingsProvider.embedBatch(chunks.map((chunk) => chunk.content));

    const points = chunks.map((chunk, index) => {
        const pointId = crypto.randomUUID();

        return {
            id: pointId,
            vector: embeddings[index],
            payload: {
                user_id: input.userId,
                document_id: input.documentId,
                chunk_id: chunk.id,
                source: input.source,
                page_number: chunk.pageNumber
            }
        };
    });

    await qdrantClient.upsert(env.QDRANT_COLLECTION, {
        points
    });


    await Promise.all(
        points.map((point) => {
            documentRepository.updateChunkQdrantPointId({
                chunkId: String(point.payload.chunk_id),
                userId: input.userId,
                qdrantPointId: String(point.id)
            })
        })
    );
}