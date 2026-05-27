import { Component, inject } from '@angular/core';

import { ThemeMode, ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent {
  readonly theme = inject(ThemeService);

  setMode(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }
}
