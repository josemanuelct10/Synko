export type QdrantVectorPayload = {
  user_id: string;
  document_id: string;
  chunk_id: string;
  source: string;
  page_number: number | null;
};