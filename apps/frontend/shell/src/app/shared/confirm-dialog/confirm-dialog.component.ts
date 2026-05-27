import { Component, HostListener, inject } from '@angular/core';

import { ConfirmDialogService } from './confirm-dialog.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-confirm-dialog',
  imports: [TranslatePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  readonly confirmDialog = inject(ConfirmDialogService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirmDialog.state()) {
      this.confirmDialog.cancel();
    }
  }
}
