import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { SalleService, SalleResponse } from '../../../core/services/salle.service';

@Component({
  selector: 'app-chercheur',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, TranslatePipe],
  template: `
    <div class="page-container">
      <form [formGroup]="form" (ngSubmit)="onSearch()" class="filter-bar">
        <div class="search-field">
          <mat-icon>location_on</mat-icon>
          <input formControlName="ville" [placeholder]="'CHERCHEUR.VILLE_PLACEHOLDER' | translate" type="text">
        </div>
        <div class="search-field">
          <mat-icon>people</mat-icon>
          <input formControlName="capacite" [placeholder]="'CHERCHEUR.CAPACITE_PLACEHOLDER' | translate" type="number">
        </div>
        <div class="search-field">
          <mat-icon>calendar_today</mat-icon>
          <input formControlName="date" type="date">
        </div>
        <div class="search-field select-field">
          <mat-icon>sort</mat-icon>
          <select formControlName="tri">
            <option value="">{{ 'CHERCHEUR.TRI_PERTINENCE' | translate }}</option>
            <option value="prix">{{ 'CHERCHEUR.TRI_PRIX' | translate }}</option>
            <option value="note">{{ 'CHERCHEUR.TRI_NOTE' | translate }}</option>
          </select>
        </div>
        <button type="submit" class="search-btn">
          <mat-icon>search</mat-icon> {{ 'CHERCHEUR.RECHERCHER_BTN' | translate }}
        </button>
        <button type="button" class="reset-btn" (click)="onReset()">
          <mat-icon>refresh</mat-icon> {{ 'CHERCHEUR.RESET_BTN' | translate }}
        </button>
      </form>

      <h1>{{ 'CHERCHEUR.TITLE' | translate }}</h1>
      <p class="results-count" *ngIf="!loading()">
        {{ salles().length }} {{ 'CHERCHEUR.RESULTS_COUNT' | translate }}
        <span *ngIf="form.value.date"> · {{ 'CHERCHEUR.DISPONIBLES_LE' | translate }} {{ formatDate(form.value.date) }}</span>
      </p>

      <div *ngIf="loading()" class="spinner-wrap">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading() && salles().length === 0" class="empty-state">
        <mat-icon>search_off</mat-icon>
        <p>{{ 'CHERCHEUR.EMPTY' | translate }}</p>
      </div>

      <div *ngIf="!loading() && salles().length > 0" class="salles-grid">
        <a *ngFor="let s of salles()" [routerLink]="['/event', s.id]" class="salle-card">
          <div class="salle-image">
            <img [src]="s.photos?.[0] || 'https://images.unsplash.com/photo-1780542900375-0cf459e38fbb?w=600'" [alt]="s.nom">
            <span class="salle-rating" *ngIf="s.note != null">
              <mat-icon inline>star</mat-icon> {{ s.note | number:'1.1-1' }} ({{ s.nbAvis }})
            </span>
          </div>
          <div class="salle-body">
            <h3>{{ s.nom }}</h3>
            <p class="salle-location"><mat-icon inline>location_on</mat-icon> {{ s.ville }}</p>
            <p class="salle-capacite"><mat-icon inline>people</mat-icon> {{ 'CHERCHEUR.CAPACITE_LABEL' | translate }} {{ s.capacite }} {{ 'CHERCHEUR.PERSONNES' | translate }}</p>
            <div class="salle-footer">
              <span class="salle-price">{{ s.prixJour | number }} MAD<small>{{ 'CHERCHEUR.PAR_JOUR' | translate }}</small></span>
              <span class="salle-link">{{ 'CHERCHEUR.VOIR_DETAILS' | translate }}</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 24px 0 4px; }
    .results-count { color: var(--primary); font-size: 0.9rem; margin: 0 0 20px; }

    .filter-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      background: #fff;
      border: 1px solid #eef0f3;
      border-radius: 14px;
      padding: 14px;
      margin-top: 20px;
    }
    .search-field {
      flex: 1;
      min-width: 140px;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 8px 12px;
    }
    .search-field mat-icon { color: var(--primary); font-size: 20px; width: 20px; height: 20px; }
    .search-field input, .search-field select {
      border: none;
      outline: none;
      width: 100%;
      font-family: inherit;
      font-size: 0.9rem;
      color: #1e293b;
      background: transparent;
    }
    .search-btn {
      background: var(--gradient);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 0 24px;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      height: 42px;
    }
    .reset-btn {
      background: #fff;
      color: #64748b;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0 20px;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      height: 42px;
    }
    .reset-btn:hover { background: #f8fafc; }

    .spinner-wrap { display: flex; justify-content: center; padding: 64px; }
    .empty-state { text-align: center; padding: 64px 24px; color: #94a3b8; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }

    .salles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      padding-bottom: 48px;
    }
    .salle-card {
      background: #fff;
      border: 1px solid #eef0f3;
      border-radius: 14px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.15s, box-shadow 0.15s;
      display: block;
    }
    .salle-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.1); }
    .salle-image { position: relative; height: 160px; }
    .salle-image img { width: 100%; height: 100%; object-fit: cover; }
    .salle-rating {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #fff;
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #f59e0b;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .salle-rating mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .salle-body { padding: 14px 16px; }
    .salle-body h3 { margin: 0 0 6px; font-size: 1rem; font-weight: 700; color: #1e293b; }
    .salle-location, .salle-capacite {
      display: flex; align-items: center; gap: 4px;
      margin: 0 0 4px; font-size: 0.82rem; color: #64748b;
    }
    .salle-location mat-icon, .salle-capacite mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .salle-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 10px;
    }
    .salle-price { font-weight: 700; color: var(--primary); font-size: 1rem; }
    .salle-price small { font-weight: 400; color: #94a3b8; font-size: 0.75rem; }
    .salle-link { font-size: 0.8rem; color: var(--accent); font-weight: 600; }
  `]
})
export class ChercheurComponent {
  form: FormGroup;
  salles = signal<SalleResponse[]>([]);
  loading = signal(true);

  constructor(
    private fb: FormBuilder,
    private salleService: SalleService,
    private route: ActivatedRoute,
  ) {
    const params = this.route.snapshot.queryParamMap;
    this.form = this.fb.group({
      ville: [params.get('ville') || ''],
      capacite: [params.get('capacite') ? Number(params.get('capacite')) : null],
      tri: [''],
      date: [params.get('date') || ''],
    });

    this.load();
  }

  onSearch() {
    this.load();
  }

  onReset() {
    this.form.reset({ ville: '', capacite: null, tri: '', date: '' });
    this.load();
  }

  private load() {
    this.loading.set(true);
    const { ville, capacite, tri, date } = this.form.value;

    this.salleService.rechercher({
      ville: ville || undefined,
      capacite: capacite || undefined,
      tri: tri || undefined,
      date: date || undefined,
    }).subscribe({
      next: (data) => {
        this.salles.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.salles.set([]);
        this.loading.set(false);
      },
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
