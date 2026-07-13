import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminSalleService } from '../../../core/services/admin-salle.service';
import { SalleResponse } from '../../../core/services/salle.service';

@Component({
  selector: 'app-admin-salles',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="header-row">
        <mat-icon class="shield-icon">apartment</mat-icon>
        <div>
          <h1>Validation des salles</h1>
          <p class="subtitle">Approuvez ou refusez les annonces soumises par les propriétaires</p>
        </div>
      </div>

      <div class="tabs-nav">
        <a routerLink="/admin" class="tab-link">KYC propriétaires</a>
        <a routerLink="/admin/salles" class="tab-link active">Salles à valider</a>
      </div>

      <div class="stat-banner">
        <mat-icon>schedule</mat-icon>
        <span><strong>{{ salles().length }}</strong> salle(s) en attente de validation</span>
      </div>

      <div *ngIf="loading()" class="spinner-wrap">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading() && salles().length === 0" class="empty-state">
        <mat-icon>check_circle</mat-icon>
        <p>Aucune salle en attente, tout est à jour !</p>
      </div>

      <div class="salle-card" *ngFor="let s of salles()">
        <div class="salle-image">
          <img [src]="s.photos?.[0] || fallbackImg" [alt]="s.nom">
        </div>

        <div class="salle-body">
          <div class="salle-top">
            <div>
              <h3>{{ s.nom }}</h3>
              <p class="proprio">Proposée par <strong>{{ s.nomProprietaire }}</strong></p>
            </div>
            <span class="status-badge">En attente</span>
          </div>

          <p class="description">{{ s.description }}</p>

          <div class="details-grid">
            <div><mat-icon inline>location_on</mat-icon> {{ s.ville }}, {{ s.adresse }}</div>
            <div><mat-icon inline>people</mat-icon> {{ s.capacite }} personnes</div>
            <div><mat-icon inline>payments</mat-icon> {{ s.prixJour | number }} MAD / jour</div>
            <div><mat-icon inline>photo_library</mat-icon> {{ s.photos?.length || 0 }} photo(s)</div>
          </div>

          <div class="actions-row" *ngIf="rejectingId() !== s.id">
            <button type="button" class="btn-approve" (click)="onValider(s)">
              <mat-icon inline>check</mat-icon> Valider
            </button>
            <button type="button" class="btn-reject" (click)="rejectingId.set(s.id)">
              <mat-icon inline>close</mat-icon> Refuser
            </button>
          </div>

          <div class="confirm-reject" *ngIf="rejectingId() === s.id">
            <p>Confirmer le refus de cette salle ?</p>
            <div class="actions-row">
              <button type="button" class="btn-cancel" (click)="rejectingId.set(null)">Annuler</button>
              <button type="button" class="btn-reject" (click)="onRefuser(s)">Confirmer le refus</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; align-items: center; gap: 12px; margin: 24px 0 16px; }
    .shield-icon { color: var(--primary); font-size: 32px; width: 32px; height: 32px; }
    h1 { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin: 0; }
    .subtitle { color: #64748b; margin: 2px 0 0; font-size: 0.9rem; }

    .tabs-nav { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #eef0f3; }
    .tab-link {
      padding: 10px 18px; text-decoration: none; color: #64748b; font-weight: 600; font-size: 0.9rem;
      border-bottom: 2px solid transparent;
    }
    .tab-link.active { color: var(--primary); border-bottom-color: var(--primary); }

    .stat-banner {
      display: flex; align-items: center; gap: 8px; background: var(--nav-active-bg);
      color: var(--primary); font-size: 0.9rem; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px;
    }

    .spinner-wrap { display: flex; justify-content: center; padding: 48px; }
    .empty-state { text-align: center; padding: 48px 24px; color: #94a3b8; }
    .empty-state mat-icon { font-size: 40px; width: 40px; height: 40px; margin-bottom: 8px; color: #10b981; }

    .salle-card {
      display: flex; gap: 16px; background: #fff; border: 1px solid #eef0f3;
      border-radius: 14px; padding: 16px; margin-bottom: 16px;
    }
    .salle-image { width: 160px; height: 120px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
    .salle-image img { width: 100%; height: 100%; object-fit: cover; }
    .salle-body { flex: 1; }
    .salle-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .salle-top h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #1e293b; }
    .proprio { margin: 2px 0 0; font-size: 0.82rem; color: #64748b; }
    .status-badge {
      background: #fed7aa; color: #c2410c; font-size: 0.72rem; font-weight: 700;
      padding: 4px 12px; border-radius: 999px; white-space: nowrap;
    }
    .description { color: #475569; font-size: 0.85rem; margin: 10px 0; line-height: 1.5; }

    .details-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 8px; font-size: 0.82rem; color: #475569; margin-bottom: 14px;
    }
    .details-grid mat-icon { font-size: 15px; width: 15px; height: 15px; color: var(--primary); vertical-align: middle; }

    .actions-row { display: flex; gap: 10px; }
    .btn-approve {
      background: #16a34a; border: none; color: #fff; border-radius: 8px;
      padding: 8px 16px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .btn-reject {
      background: #dc2626; border: none; color: #fff; border-radius: 8px;
      padding: 8px 16px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .btn-cancel {
      background: #fff; border: 1px solid #e2e8f0; color: #64748b; border-radius: 8px;
      padding: 8px 16px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
    }
    .confirm-reject p { margin: 0 0 8px; font-size: 0.85rem; color: #991b1b; font-weight: 600; }

    @media (max-width: 600px) {
      .salle-card { flex-direction: column; }
      .salle-image { width: 100%; height: 160px; }
    }
  `]
})
export class AdminSallesComponent {
  loading = signal(true);
  salles = signal<SalleResponse[]>([]);
  rejectingId = signal<number | null>(null);
  fallbackImg = 'https://images.unsplash.com/photo-1780542900375-0cf459e38fbb?w=400';

  constructor(
    private adminSalleService: AdminSalleService,
    private snackBar: MatSnackBar,
  ) {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.adminSalleService.getEnAttente().subscribe({
      next: (list) => { this.salles.set(list); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erreur de chargement des salles', 'Fermer', { duration: 4000 });
      },
    });
  }

  onValider(s: SalleResponse) {
    this.adminSalleService.valider(s.id).subscribe({
      next: () => {
        this.snackBar.open(`"${s.nom}" a été validée`, 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erreur lors de la validation', 'Fermer', { duration: 4000 }),
    });
  }

  onRefuser(s: SalleResponse) {
    this.adminSalleService.refuser(s.id).subscribe({
      next: () => {
        this.rejectingId.set(null);
        this.snackBar.open(`"${s.nom}" a été refusée`, 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 4000 }),
    });
  }
}
