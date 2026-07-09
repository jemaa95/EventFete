import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface LoginPayload { email: string; password: string; }
export interface AuthResponse { token: string; user: { name: string; email: string; role: string; }; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ef_token';
  private readonly API = 'http://localhost:8080/api/auth';

  currentUser = signal<AuthResponse['user'] | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('ef_user');
    if (stored) this.currentUser.set(JSON.parse(stored));
  }

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${this.API}/login`, payload).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem('ef_user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('ef_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
