export type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'processed'
  | 'failed'
  | 'deleted';

export type SynkoDocument = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: string;
  status: DocumentStatus;
  errorMessage: string | null;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
};

export type DocumentsListResponse = {
  documents: SynkoDocument[];
};

export type UploadDocumentResponse = {
  message: string;
  document: SynkoDocument;
};

export type DeleteDocumentResponse = {
  message: string;
};