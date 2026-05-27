import { VECTOR_SIZE } from "../qdrant/qdrant.collection.js";
import type { EmbeddingVector, EmbeddingsProvider } from "./embeddings.provider.js";

const hashText = (text: string): number => {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
};

const createDeterministicVector = (text: string): EmbeddingVector => {
  const seed = hashText(text);
  const vector: number[] = [];

  for (let index = 0; index < VECTOR_SIZE; index += 1) {
    const value = Math.sin(seed + index) * 10000;
    vector.push(value - Math.floor(value));
  }

  return vector;
};

export class MockEmbeddingsProvider implements EmbeddingsProvider {
  async embedText(text: string): Promise<EmbeddingVector> {
    return createDeterministicVector(text);
  }

  async embedBatch(texts: string[]): Promise<EmbeddingVector[]> {
    return Promise.all(texts.map((text) => this.embedText(text)));
  }
}

export const embeddingsProvider = new MockEmbeddingsProvider();