import { Component, inject } from '@angular/core';

import { I18nService, type Locale } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss'
})
export class LanguageSwitcherComponent {
  readonly i18n = inject(I18nService);

  setLocale(locale: Locale): void {
    this.i18n.setLocale(locale);
  }
}
