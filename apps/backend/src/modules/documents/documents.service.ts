import { AppError } from "../../shared/errors/app-error.js";
import { documentRepository } from "./documents.repository.js";
import type { DeleteDocumentResponse, DocumentDetailResponse, DocumentResponse, DocumentsListResponse } from "./documents.types.js";

const mapDocumentToResponse = (document: {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: bigint;
  status: string;
  errorMessage: string | null;
  storagePath: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt: Date | null;
}): DocumentResponse => {
  return {
    id: document.id,
    originalName: document.originalName,
    storedName: document.storedName,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes.toString(),
    status: document.status,
    errorMessage: document.errorMessage,
    storagePath: document.storagePath,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    processedAt: document.processedAt?.toISOString() ?? null
  };
};

export const documentsService = {
    async list(userId: string): Promise<DocumentsListResponse> {
        const documents = await documentRepository.findManyByUserId(userId);

        return {
            documents: documents.map(mapDocumentToResponse)
        };
    },

    async getById(documentId: string, userId: string): Promise<DocumentDetailResponse> {
        const document = await documentRepository.findByIdAndUserId(documentId, userId);

        if (!document) throw new AppError("Document not found", 404);

        return {
            document: mapDocumentToResponse(document)
        };
    },

    async delete(documentId: string, userId: string): Promise<DeleteDocumentResponse> {
        const result = await documentRepository.softDeleteByIdAndUserId(documentId, userId);

        if (result.count === 0) throw new AppError("Document not found", 404);

        return {
            message: "Document deleted successfully"
        };
    }

}