import { env } from "../../config/env.js";
import { qdrantClient } from "./qdrant.client.js";

export const VECTOR_SIZE = 384;

export const ensureQdrantCollection = async (): Promise<void> => {
  const collections = await qdrantClient.getCollections();

  const exists = collections.collections.some(
    (collection) => collection.name === env.QDRANT_COLLECTION
  );

  if (exists) {
    return;
  }

  await qdrantClient.createCollection(env.QDRANT_COLLECTION, {
    vectors: {
      size: VECTOR_SIZE,
      distance: "Cosine"
    }
  });
};