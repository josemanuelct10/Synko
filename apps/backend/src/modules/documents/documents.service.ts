import fs from "node:fs/promises";
import path from "node:path";

import { extractTextFromPdf } from "../../infrastructure/pdf/pdf-text-extractor.js";
import { createStoredFileName, ensureUploadsDirectory } from "../../infrastructure/storage/local-storage.js";
import { AppError } from "../../shared/errors/app-error.js";
import { splitTextIntoChunks } from "./documents.chunking.js";
import { documentRepository } from "./documents.repository.js";
import type { DeleteDocumentResponse, DocumentDetailResponse, DocumentResponse, DocumentsListResponse, UploadDocumentResponse } from "./documents.types.js";
import { indexDocumentChunksInQdrant } from "./documents.vector-indexing.js";
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
    async upload(userId: string, file: Express.Multer.File | undefined) : Promise<UploadDocumentResponse> {
        if (!file) {
        throw new AppError("Document file is required", 400);
        }

        if (file.mimetype !== "application/pdf") {
        throw new AppError("Only PDF files are allowed", 400);
        }

        const uploadsDirectory = await ensureUploadsDirectory();
        const storedName = createStoredFileName(file.originalname);
        const absoluteStoragePath = path.join(uploadsDirectory, storedName);

        await fs.writeFile(absoluteStoragePath, file.buffer);

        const createdDocument = await documentRepository.create({
        userId,
        originalName: file.originalname,
        storedName,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        storagePath: absoluteStoragePath
        });

        try {
        await documentRepository.updateStatus({
            documentId: createdDocument.id,
            userId,
            status: "processing",
            errorMessage: null
        });

        const extractedPdf = await extractTextFromPdf(absoluteStoragePath);

        if (!extractedPdf.text) {
            throw new AppError("No text could be extracted from the PDF", 422);
        }

        const chunks = splitTextIntoChunks(extractedPdf.text);

        if (chunks.length === 0) {
            throw new AppError("No valid chunks could be generated", 422);
        }

        await documentRepository.deleteChunksByDocumentId(
            createdDocument.id,
            userId
        );

        await documentRepository.createChunks({
            documentId: createdDocument.id,
            userId,
            chunks
        });

        await indexDocumentChunksInQdrant({
            userId,
            documentId: createdDocument.id,
            source: createdDocument.originalName
        });

        const processedDocument = await documentRepository.updateStatus({
            documentId: createdDocument.id,
            userId,
            status: "processed",
            errorMessage: null,
            processedAt: new Date()
        });

        return {
            message: "Document uploaded and processed successfully",
            document: mapDocumentToResponse(processedDocument)
        };
        } catch (error) {
        const errorMessage =
            error instanceof Error
            ? error.message
            : "Unknown document processing error";

        const failedDocument = await documentRepository.updateStatus({
            documentId: createdDocument.id,
            userId,
            status: "failed",
            errorMessage,
            processedAt: null
        });

        return {
            message: "Document uploaded but processing failed",
            document: mapDocumentToResponse(failedDocument)
        };
        }
    },

    async list(userId: string): Promise<DocumentsListResponse> {
        const documents = await documentRepository.findManyByUserId(userId);

        return {
        documents: documents.map(mapDocumentToResponse)
        };
    },

    async getById(documentId: string, userId: string) : Promise<DocumentDetailResponse> {
        const document = await documentRepository.findByIdAndUserId(
        documentId,
        userId
        );

        if (!document) {
        throw new AppError("Document not found", 404);
        }

        return {
        document: mapDocumentToResponse(document)
        };
    },

    async delete(documentId: string, userId: string) : Promise<DeleteDocumentResponse> {
        const result = await documentRepository.softDeleteByIdAndUserId(
        documentId,
        userId
        );

        if (result.count === 0) {
        throw new AppError("Document not found", 404);
        }

        return {
        message: "Document deleted successfully"
        };
    }
};