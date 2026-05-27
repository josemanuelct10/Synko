import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeleteDocumentResponse, DocumentsListResponse, UploadDocumentResponse } from './documents.models';
import { API_BASE_URL } from '../auth/auth.config';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  constructor(
    private readonly http: HttpClient
  ){}

  list(): Observable<DocumentsListResponse> {
    return this.http.get<DocumentsListResponse>(`${API_BASE_URL}/documents`);
  }

  uploads(file: File): Observable<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadDocumentResponse>(`${API_BASE_URL}/documents/upload`, formData);
  }

  delete(documentId: string): Observable<DeleteDocumentResponse> {
    return this.http.delete<DeleteDocumentResponse>(`${API_BASE_URL}/documents/${documentId}`);
  }
}
