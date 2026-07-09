import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar class="navbar">
      <a routerLink="/dashboard" class="logo">
        <mat-icon>celebration</mat-icon>
        EventFete
      </a>

      <span class="spacer"></span>

      <nav class="nav-links">
        <a mat-button routerLink="/dashboard" routerLinkActive="active">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>
        <a mat-button routerLink="/events/create" routerLinkActive="active">
          <mat-icon>event</mat-icon> Mes Événements
        </a>
      </nav>

      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <button mat-menu-item routerLink="/profile">
          <mat-icon>person</mat-icon> Profil
        </button>
        <button mat-menu-item (click)="authService.logout()">
          <mat-icon>logout</mat-icon> Déconnexion
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      mat-icon { color: var(--accent); }
    }
    .spacer { flex: 1; }
    .nav-links { display: flex; gap: 4px; }
    .nav-links a { color: #64748b; border-radius: 8px; }
    .nav-links a.active { color: var(--primary); background: #eff6ff; }
    @media (max-width: 600px) {
      .nav-links { display: none; }
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
}