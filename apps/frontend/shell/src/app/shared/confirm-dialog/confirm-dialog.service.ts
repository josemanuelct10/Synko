import { Injectable, signal } from '@angular/core';

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: 'default' | 'danger';
};

type ConfirmDialogState = ConfirmDialogOptions & {
  isOpen: boolean;
};

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<ConfirmDialogState | null>(null);
  private resolver: ((value: boolean) => void) | null = null;

  open(options: ConfirmDialogOptions): Promise<boolean> {
    this.state.set({ ...options, isOpen: true });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  confirm(): void {
    this.resolver?.(true);
    this.close();
  }

  cancel(): void {
    this.resolver?.(false);
    this.close();
  }

  private close(): void {
    this.resolver = null;
    this.state.set(null);
  }
}
