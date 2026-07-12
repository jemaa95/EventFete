import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReservationService, ReservationResponse } from '../../core/services/reservation.service';

type Filtre = 'toutes' | 'avenir' | 'terminees' | 'annulees';

@Component({
  selector: 'app-reservations-historique',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <h1>Historique des réservations</h1>
      <p class="subtitle">Consultez toutes vos réservations passées et à venir</p>

      <div class="tabs">
        <button
          *ngFor="let t of tabs"
          type="button"
          class="tab"
          [class.active]="filtre() === t.key"
          [class.tab-annulees-active]="filtre() === t.key && t.key === 'annulees'"
          (click)="filtre.set(t.key)"
        >
          {{ t.label }} ({{ counts()[t.key] }})
        </button>
      </div>

      <div *ngIf="loading()" class="spinner-wrap">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading() && filtered().length === 0" class="empty-state">
        <mat-icon>event_busy</mat-icon>
        <p>Aucune réservation dans cette catégorie.</p>
      </div>

      <div class="list" *ngIf="!loading()">
        <div class="resa-card" *ngFor="let r of filtered()">
          <div class="resa-image">
            <img [src]="r['sallePhoto'] || fallbackImg" [alt]="r['salleNom']">
          </div>
          <div class="resa-body">
            <div class="resa-top">
              <h3>{{ r['salleNom'] }}</h3>
              <span class="status-badge" [ngClass]="statutClass(r)">{{ statutLabel(r) }}</span>
            </div>
            <p class="resa-location" *ngIf="r['salleAdresse'] || r['salleVille']">
              <mat-icon inline>location_on</mat-icon>
              {{ r['salleAdresse'] }}{{ r['salleAdresse'] && r['salleVille'] ? ', ' : '' }}{{ r['salleVille'] }}
            </p>
            <p class="resa-date"><mat-icon inline>event</mat-icon> {{ formatDate(r['dateDebut']) }}</p>

            <div class="resa-footer">
              <div>
                <span class="label">Numéro de réservation</span>
                <span class="ref">EF-{{ year(r['dateDebut']) }}-{{ pad(r['id']) }}</span>
              </div>
              <div>
                <span class="label">Montant total</span>
                <span class="montant">{{ montant(r) | number }} MAD</span>
              </div>
              <div class="actions">
                <button type="button" class="btn-outline">Détails</button>
                <button
                  type="button"
                  class="btn-danger"
                  *ngIf="isAVenir(r)"
                  (click)="onAnnuler(r)"
                  [disabled]="cancelling() === r['id']"
                >
                  Annuler
                </button>
                <button type="button" class="btn-primary" *ngIf="isTerminee(r)">
                  Reçu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 24px 0 2px; }
    .subtitle { color: #64748b; margin: 0 0 20px; }
    .spinner-wrap { display: flex; justify-content: center; padding: 64px; }

    .tabs {
      display: flex; gap: 8px; background: #fff; border: 1px solid #eef0f3;
      border-radius: 14px; padding: 8px; margin-bottom: 20px; flex-wrap: wrap;
    }
    .tab {
      border: none; background: transparent; padding: 8px 16px; border-radius: 10px;
      font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer;
    }
    .tab.active { background: var(--gradient); color: #fff; }
    .tab.tab-annulees-active { background: #dc2626; }

    .empty-state { text-align: center; padding: 64px 24px; color: #94a3b8; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }

    .list { display: flex; flex-direction: column; gap: 16px; padding-bottom: 48px; }
    .resa-card {
      display: flex; gap: 16px; background: #fff; border: 1px solid #eef0f3;
      border-radius: 14px; padding: 16px;
    }
    .resa-image { width: 120px; height: 90px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
    .resa-image img { width: 100%; height: 100%; object-fit: cover; }
    .resa-body { flex: 1; }
    .resa-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .resa-top h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #1e293b; }
    .status-badge {
      font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 999px;
    }
    .status-badge.avenir { background: #dbeafe; color: #1d4ed8; }
    .status-badge.terminee { background: #dcfce7; color: #15803d; }
    .status-badge.annulee { background: #fee2e2; color: #dc2626; }

    .resa-location, .resa-date {
      display: flex; align-items: center; gap: 4px; margin: 4px 0; font-size: 0.85rem; color: #64748b;
    }
    .resa-location mat-icon, .resa-date mat-icon { font-size: 15px; width: 15px; height: 15px; color: var(--primary); }

    .resa-footer {
      display: flex; align-items: center; gap: 32px; margin-top: 12px; flex-wrap: wrap;
    }
    .label { display: block; font-size: 0.72rem; color: #94a3b8; }
    .ref { font-weight: 600; color: var(--primary); font-size: 0.85rem; }
    .montant { font-weight: 700; color: var(--accent); font-size: 0.95rem; }
    .actions { display: flex; gap: 8px; margin-left: auto; }
    .btn-outline {
      background: #fff; border: 1px solid #e2e8f0; color: #475569;
      border-radius: 8px; padding: 6px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    }
    .btn-danger {
      background: #dc2626; border: none; color: #fff;
      border-radius: 8px; padding: 6px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    }
    .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary {
      background: var(--gradient); border: none; color: #fff;
      border-radius: 8px; padding: 6px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    }

    @media (max-width: 640px) {
      .resa-card { flex-direction: column; }
      .resa-image { width: 100%; height: 140px; }
      .resa-footer { gap: 16px; }
      .actions { margin-left: 0; width: 100%; }
    }
  `]
})
export class ReservationsHistoriqueComponent {
  loading = signal(true);
  cancelling = signal<number | null>(null);
  reservations = signal<ReservationResponse[]>([]);
  filtre = signal<Filtre>('toutes');
  fallbackImg = 'https://images.unsplash.com/photo-1780542900375-0cf459e38fbb?w=400';

  tabs: { key: Filtre; label: string }[] = [
    { key: 'toutes', label: 'Toutes' },
    { key: 'avenir', label: 'À venir' },
    { key: 'terminees', label: 'Terminées' },
    { key: 'annulees', label: 'Annulées' },
  ];

  counts = computed(() => {
    const list = this.reservations();
    return {
      toutes: list.length,
      avenir: list.filter(r => this.isAVenir(r)).length,
      terminees: list.filter(r => this.isTerminee(r)).length,
      annulees: list.filter(r => this.isAnnulee(r)).length,
    };
  });

  filtered = computed(() => {
    const list = this.reservations();
    switch (this.filtre()) {
      case 'avenir': return list.filter(r => this.isAVenir(r));
      case 'terminees': return list.filter(r => this.isTerminee(r));
      case 'annulees': return list.filter(r => this.isAnnulee(r));
      default: return list;
    }
  });

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
  ) {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.reservationService.getMesReservations().subscribe({
      next: (list) => {
        this.reservations.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erreur de chargement des réservations', 'Fermer', { duration: 4000 });
      },
    });
  }

  isAnnulee(r: ReservationResponse): boolean {
    return r['statut'] === 'ANNULEE';
  }

  isAVenir(r: ReservationResponse): boolean {
    return r['statut'] === 'CONFIRMEE' && new Date(r['dateDebut'] as string) > new Date();
  }

  isTerminee(r: ReservationResponse): boolean {
    return r['statut'] === 'CONFIRMEE' && new Date(r['dateFin'] as string) <= new Date();
  }

  statutLabel(r: ReservationResponse): string {
    if (this.isAnnulee(r)) return 'Annulée';
    if (this.isAVenir(r)) return 'À venir';
    if (this.isTerminee(r)) return 'Terminée';
    return String(r['statut'] ?? '');
  }

  statutClass(r: ReservationResponse): string {
    if (this.isAnnulee(r)) return 'annulee';
    if (this.isAVenir(r)) return 'avenir';
    return 'terminee';
  }

  formatDate(date: unknown): string {
    if (!date) return '';
    return new Date(date as string).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  year(date: unknown): string {
    if (!date) return '----';
    return String(new Date(date as string).getFullYear());
  }

  pad(id: unknown): string {
    return String(id ?? '').padStart(4, '0');
  }

  montant(r: ReservationResponse): number {
    return Number(r['montantTotal'] ?? 0);
  }

  onAnnuler(r: ReservationResponse) {
    const id = r['id'] as number;
    this.cancelling.set(id);

    this.reservationService.annuler(id).subscribe({
      next: () => {
        this.cancelling.set(null);
        this.snackBar.open('Réservation annulée', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => {
        this.cancelling.set(null);
        this.snackBar.open("Erreur lors de l'annulation", 'Fermer', { duration: 4000 });
      },
    });
  }
}
