import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AuthUser } from '../../core/auth/auth.model';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() user: AuthUser | null = null;
  @Output() signOut = new EventEmitter<void>();

  onSignOut(): void {
    this.signOut.emit();
  }
}
