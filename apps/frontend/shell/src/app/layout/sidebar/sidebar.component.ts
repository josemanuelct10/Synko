import { Component, EventEmitter, HostListener, Input, OnInit, Output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthUser } from '../../core/auth/auth.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
import { ThemeSwitcherComponent } from '../../shared/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LanguageSwitcherComponent, ThemeSwitcherComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() user: AuthUser | null = null;
  @Output() signOut = new EventEmitter<void>();
  readonly isMobile = signal(false);
  readonly isMenuOpen = signal(false);

  ngOnInit(): void {
    this.syncViewport();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncViewport();
  }

  onSignOut(): void {
    this.closeMenu();
    this.signOut.emit();
  }

  toggleMenu(): void {
    if (!this.isMobile()) return;
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  closeMenu(): void {
    if (!this.isMobile()) return;
    this.isMenuOpen.set(false);
  }

  private syncViewport(): void {
    if (typeof window === 'undefined') return;

    const isMobileViewport = window.matchMedia('(max-width: 980px)').matches;
    this.isMobile.set(isMobileViewport);

    if (!isMobileViewport) {
      this.isMenuOpen.set(false);
    }
  }
}
