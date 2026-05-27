import { Injectable, signal } from '@angular/core';
import { AuthUser, LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse } from './auth.model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL, AUTH_TOKEN_KEY } from './auth.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUserSignal = signal<AuthUser | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private readonly http: HttpClient
  ){}

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_BASE_URL}/auth/register`, payload);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, payload).pipe(
      tap((response) => {
        sessionStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
        this.currentUserSignal.set(response.user);
      })
    );
  }

  loadCurrentUser(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${API_BASE_URL}/auth/me`).pipe(
      tap((response) => {
        this.currentUserSignal.set(response.user);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
}
