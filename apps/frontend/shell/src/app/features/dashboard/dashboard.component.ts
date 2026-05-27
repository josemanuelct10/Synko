import { Component, OnInit, signal } from '@angular/core';
import { AuthUser } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly user = signal<AuthUser | null>(null);
  readonly errorMessage = signal<string | null>(null);

  constructor (
    private readonly authService: AuthService,
    private readonly router: Router
  ){}

  ngOnInit(): void {
    this.authService.loadCurrentUser().subscribe({
      next: (response) => {
        this.user.set(response.user);
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
}
