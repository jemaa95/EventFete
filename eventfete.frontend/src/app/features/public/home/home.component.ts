import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="hero">
      <h1>Trouvez votre salle parfaite</h1>
      <p class="hero-subtitle">Des milliers de salles pour tous vos événements</p>

      <form [formGroup]="form" (ngSubmit)="onSearch()" class="search-bar">
        <div class="search-field">
          <mat-icon>location_on</mat-icon>
          <input formControlName="ville" placeholder="Ville" type="text">
        </div>
        <div class="search-field">
          <mat-icon>calendar_today</mat-icon>
          <input formControlName="date" type="date">
        </div>
        <div class="search-field">
          <mat-icon>people</mat-icon>
          <input formControlName="capacite" placeholder="Capacité" type="number">
        </div>
        <button type="submit" class="search-btn">
          <mat-icon>search</mat-icon> Rechercher une salle
        </button>
      </form>
    </div>

    <div class="why-section">
      <h2>Pourquoi choisir EventFete ?</h2>
      <div class="why-grid">
        <div class="why-card">
          <div class="why-icon"><mat-icon>search</mat-icon></div>
          <h3>Recherche facile</h3>
          <p>Trouvez la salle idéale en quelques clics selon vos critères</p>
        </div>
        <div class="why-card">
          <div class="why-icon"><mat-icon>location_on</mat-icon></div>
          <h3>Partout au Maroc</h3>
          <p>Des salles disponibles dans toutes les grandes villes</p>
        </div>
        <div class="why-card">
          <div class="why-icon"><mat-icon>event_available</mat-icon></div>
          <h3>Réservation simple</h3>
          <p>Processus de réservation rapide et sécurisé en 3 étapes</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero {
      background: var(--gradient);
      padding: 72px 24px 96px;
      text-align: center;
      color: #fff;
    }
    h1 { font-size: 2.25rem; font-weight: 800; margin: 0 0 8px; }
    .hero-subtitle { font-size: 1.05rem; opacity: 0.92; margin: 0 0 32px; }

    .search-bar {
      max-width: 760px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      box-shadow: 0 12px 32px rgba(0,0,0,0.18);
    }
    .search-field {
      flex: 1;
      min-width: 140px;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
    }
    .search-field mat-icon { color: var(--primary); font-size: 20px; width: 20px; height: 20px; }
    .search-field input {
      border: none;
      outline: none;
      width: 100%;
      font-family: inherit;
      font-size: 0.9rem;
      color: #1e293b;
    }
    .search-btn {
      background: var(--gradient);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 0 28px;
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      flex: 1 1 100%;
      justify-content: center;
      height: 48px;
    }
    .search-btn:hover { opacity: 0.92; }

    .why-section {
      max-width: 1000px;
      margin: 0 auto;
      padding: 64px 24px;
      text-align: center;
    }
    .why-section h2 { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin: 0 0 32px; }
    .why-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .why-card {
      background: #fff;
      border: 1px solid #eef0f3;
      border-radius: 16px;
      padding: 28px 20px;
    }
    .why-icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--nav-active-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .why-icon mat-icon { color: var(--primary); }
    .why-card h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
    .why-card p { font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.5; }

    @media (max-width: 640px) {
      h1 { font-size: 1.6rem; }
      .search-bar { flex-direction: column; }
    }
  `]
})
export class HomeComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      ville: [''],
      date: [''],
      capacite: [null],
    });
  }

  onSearch() {
    const { ville, capacite } = this.form.value;
    this.router.navigate(['/chercheur'], {
      queryParams: {
        ville: ville || null,
        capacite: capacite || null,
      },
    });
  }
}
