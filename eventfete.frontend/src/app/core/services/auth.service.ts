import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginPayload {
  email: string;
  password: string;
}

export type UserRole = 'ROLE_CLIENT' | 'ROLE_PROPRIO' | 'ROLE_ADMIN';

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  role: UserRole;
}

// ⚠️ Doit correspondre EXACTEMENT à com.eventfete.dto.response.AuthResponse
// renvoyé par /api/auth/register, /api/auth/login et /api/auth/refresh.
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
}

export interface CurrentUser {
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ef_token';
  private readonly REFRESH_KEY = 'ef_refresh_token';
  private readonly USER_KEY = 'ef_user';
  private readonly API = `${environment.apiUrl}/auth`;
  private readonly isBrowser: boolean;

  currentUser = signal<CurrentUser | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const stored = localStorage.getItem(this.USER_KEY);
      if (stored) {
        try {
          this.currentUser.set(JSON.parse(stored));
        } catch {
          // Valeur corrompue (ex: héritée d'une ancienne version) : on nettoie.
          localStorage.removeItem(this.TOKEN_KEY);
          localStorage.removeItem(this.REFRESH_KEY);
          localStorage.removeItem(this.USER_KEY);
        }
      }
    }
  }

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${this.API}/login`, payload).pipe(
      tap(res => this.persistSession(res))
    );
  }

  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(`${this.API}/register`, payload).pipe(
      tap(res => this.persistSession(res))
    );
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.REFRESH_KEY) : null;
  }

  // Appelle POST /api/auth/refresh avec le refresh token stocké, et met à jour
  // la session avec les nouveaux tokens reçus. Utilisé par l'intercepteur HTTP
  // quand une requête échoue avec un token d'accès expiré (401/403).
  refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.API}/refresh`, null, {
      headers: refreshToken ? { 'Refresh-Token': refreshToken } : {},
    }).pipe(
      tap(res => this.persistSession(res))
    );
  }

  private persistSession(res: AuthResponse) {
    const user: CurrentUser = {
      email: res.email,
      nom: res.nom,
      prenom: res.prenom,
      role: res.role,
    };

    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, res.accessToken);
      localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUser.set(user);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
