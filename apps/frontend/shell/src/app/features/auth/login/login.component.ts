import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageSwitcherComponent } from '../../../shared/language-switcher/language-switcher.component';
import { ThemeSwitcherComponent } from '../../../shared/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe, LanguageSwitcherComponent, ThemeSwitcherComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly i18n = inject(I18nService);
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  form = {
    email: '',
    password: ''
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ){}

  submit(): void {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.login(this.form).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || this.i18n.t('login.genericError'));
        this.isSubmitting.set(false);
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
