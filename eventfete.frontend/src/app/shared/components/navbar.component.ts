import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService, AppLang } from '../../core/services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatIconModule, MatMenuModule, MatButtonModule,
    RouterLink, RouterLinkActive, CommonModule, TranslatePipe,
  ],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="brand">
        <span class="logo">EF</span>
        <span class="brand-name">{{ 'NAVBAR.BRAND' | translate }}</span>
      </a>

      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          <mat-icon>home</mat-icon> {{ 'NAVBAR.ACCUEIL' | translate }}
        </a>
        <a routerLink="/chercheur" routerLinkActive="active" class="nav-link">
          <mat-icon>search</mat-icon> {{ 'NAVBAR.CHERCHEUR' | translate }}
        </a>
        <a routerLink="/reservations" routerLinkActive="active" class="nav-link">
          <mat-icon>history</mat-icon> {{ 'NAVBAR.RESERVATIONS' | translate }}
        </a>
        <a routerLink="/profil" routerLinkActive="active" class="nav-link">
          <mat-icon>person</mat-icon> {{ 'NAVBAR.PROFIL' | translate }}
        </a>
      </div>

      <div class="nav-right">
        <a routerLink="/dashboard" routerLinkActive="active-muted" class="nav-link-muted">
          <mat-icon>storefront</mat-icon> {{ 'NAVBAR.PROPRIETAIRE' | translate }}
        </a>
        <a routerLink="/admin" routerLinkActive="active-muted" class="nav-link-muted">
          <mat-icon>admin_panel_settings</mat-icon> {{ 'NAVBAR.ADMINISTRATEUR' | translate }}
        </a>

        <button mat-icon-button [matMenuTriggerFor]="langMenu" class="lang-btn">
          <mat-icon>language</mat-icon>
        </button>
        <mat-menu #langMenu="matMenu">
          <button mat-menu-item (click)="setLang('fr')" [class.lang-active]="langService.currentLang() === 'fr'">
            {{ 'LANG_SWITCH.FR' | translate }}
          </button>
          <button mat-menu-item (click)="setLang('en')" [class.lang-active]="langService.currentLang() === 'en'">
            {{ 'LANG_SWITCH.EN' | translate }}
          </button>
          <button mat-menu-item (click)="setLang('ar')" [class.lang-active]="langService.currentLang() === 'ar'">
            {{ 'LANG_SWITCH.AR' | translate }}
          </button>
        </mat-menu>

        @if(authService.isLoggedIn()){
          <button mat-icon-button [matMenuTriggerFor]="menu" class="account-btn">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon> {{ 'NAVBAR.DECONNEXION' | translate }}
            </button>
          </mat-menu>
        } @else {
          <a routerLink="/login" class="nav-link-muted">{{ 'NAVBAR.CONNEXION' | translate }}</a>
          <a routerLink="/register" class="signup-btn">{{ 'NAVBAR.SINSCRIRE' | translate }}</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #fff;
      border-bottom: 1px solid #eef0f3;
      flex-wrap: wrap;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      margin-right: 24px;
    }
    .logo {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: var(--gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .brand-name { font-weight: 700; color: #1e1b2e; font-size: 1.05rem; }

    .nav-links {
      display: flex;
      gap: 4px;
      flex: 1;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      text-decoration: none;
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
    }
    .nav-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .nav-link:hover { background: #f8fafc; }
    .nav-link.active {
      background: var(--nav-active-bg);
      color: var(--primary);
      font-weight: 600;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .nav-link-muted {
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .nav-link-muted mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .nav-link-muted.active-muted { color: var(--primary); }

    .signup-btn {
      background: var(--gradient);
      color: #fff;
      text-decoration: none;
      padding: 8px 18px;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .account-btn, .lang-btn { color: var(--primary); }
    .lang-active { color: var(--primary); font-weight: 700; }

    @media (max-width: 900px) {
      .nav-links { order: 3; width: 100%; justify-content: center; }
    }
  `]
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    public langService: LanguageService,
    private router: Router,
  ) {}

  logout() { this.authService.logout(); this.router.navigate(['/login']); }

  setLang(lang: AppLang) {
    this.langService.use(lang);
  }
}
