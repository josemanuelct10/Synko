import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageSwitcherComponent } from '../../../shared/language-switcher/language-switcher.component';
import { ThemeSwitcherComponent } from '../../../shared/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, TranslatePipe, LanguageSwitcherComponent, ThemeSwitcherComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  readonly i18n = inject(I18nService);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  form = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.register(this.form).subscribe({
      next: () => {
        this.successMessage.set(this.i18n.t('register.success'));
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? error?.error?.error?.message ?? this.i18n.t('register.genericError'));
        this.isSubmitting.set(false);
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
