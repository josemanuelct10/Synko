export type DocumentResponse = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: string;
  status: string;
  errorMessage: string | null;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
};

export type DocumentsListResponse = {
  documents: DocumentResponse[];
};

export type DocumentDetailResponse = {
  document: DocumentResponse;
};

export type DeleteDocumentResponse = {
  message: string;
};