import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SynkoDocument } from '../../core/documents/documents.models';
import { DocumentsService } from '../../core/documents/documents.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { AuthUser } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documents',
  imports: [TranslatePipe, LanguageSwitcherComponent, SidebarComponent],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
})
export class Documents implements OnInit {
  readonly i18n = inject(I18nService);
  readonly confirmDialog = inject(ConfirmDialogService);
  readonly user = signal<AuthUser | null>(null);
  readonly documents = signal<SynkoDocument[]>([]);
  readonly isLoading = signal(false);
  readonly isUploading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly isDragActive = signal(false);
  private dragDepth = 0;

  readonly hasDocuments = computed(() => this.documents().length > 0);
  readonly processedDocumentsCount = computed(() => this.documents().filter((document) => document.status === 'processed').length);

  constructor(
    private readonly documentsService: DocumentsService,
    private readonly authService: AuthService,
    private readonly router: Router
  ){}

  ngOnInit(): void {
    this.authService.loadCurrentUser().subscribe({
      next: (response) => {
        this.user.set(response.user);
        this.loadDocuments();
      },
      error: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadDocuments(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.documentsService.list().subscribe({
      next: (response) => {
        this.documents.set(response.documents);
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.error?.message ?? this.i18n.t('documents.loadError')
        );
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.selectPdfFile(file, () => {
      input.value = '';
    });
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth += 1;
    this.isDragActive.set(true);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);

    if (this.dragDepth === 0) {
      this.isDragActive.set(false);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = 0;
    this.isDragActive.set(false);

    const file = event.dataTransfer?.files?.[0] ?? null;
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.selectPdfFile(file);
  }

  uploadSelectedFile(): void {
    const file = this.selectedFile();

    if (!file) {
      this.errorMessage.set(this.i18n.t('documents.selectPdfFirst'));
      return;
    }

    this.isUploading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.documentsService.uploads(file).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.selectedFile.set(null);
        this.loadDocuments();
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.error?.message ?? this.i18n.t('documents.uploadError')
        );
      },
      complete: () => {
        this.isUploading.set(false);
      }
    })
  }

  async deleteDocument(document: SynkoDocument): Promise<void> {
    const confirmed = await this.confirmDialog.open({
      title: this.i18n.t('documents.deleteModalTitle'),
      message: this.i18n.t('documents.deleteConfirm', { name: document.originalName }),
      confirmLabel: this.i18n.t('documents.delete'),
      cancelLabel: this.i18n.t('common.cancel'),
      tone: 'danger'
    });

    if (!confirmed) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.documentsService.delete(document.id).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loadDocuments();
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.error?.message ?? this.i18n.t('documents.deleteError')
        );
      }
    });
  }

  formatSize(sizeBytes: string): string {
    const size = parseInt(sizeBytes, 10);

    if (Number.isNaN(size)) return '-';

    const sizeInMb = size / 1024 / 1024;

    return `${sizeInMb.toFixed(2)} MB`;
  }

  statusKey(status: SynkoDocument['status']): string {
    return `status.${status}`;
  }

  private selectPdfFile(file: File | null, onInvalid?: () => void): void {
    if (!file) {
      this.selectedFile.set(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      this.selectedFile.set(null);
      this.errorMessage.set(this.i18n.t('documents.onlyPdf'));

      if (onInvalid) {
        onInvalid();
      }

      return;
    }

    this.selectedFile.set(file);
  }

}
