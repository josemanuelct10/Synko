export type EmbeddingVector = number[];

export interface EmbeddingsProvider {
  embedText(text: string): Promise<EmbeddingVector>;
  embedBatch(texts: string[]): Promise<EmbeddingVector[]>;
}