import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReservationService, ReservationResponse } from '../../core/services/reservation.service';

type Filtre = 'toutes' | 'attente' | 'avenir' | 'terminees' | 'annulees';

@Component({
  selector: 'app-reservations-proprio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <h1>Réservations reçues</h1>
      <p class="subtitle">Toutes les réservations effectuées sur vos salles</p>

      <div class="tabs">
        <button
          *ngFor="let t of tabs"
          type="button"
          class="tab"
          [class.active]="filtre() === t.key"
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
        <div class="resa-card" *ngFor="let r of filtered()" [class.pending]="isEnAttente(r)">
          <div class="resa-image">
            <img [src]="r['sallePhoto'] || fallbackImg" [alt]="r['salleNom']">
          </div>
          <div class="resa-body">
            <div class="resa-top">
              <div>
                <h3>{{ r['salleNom'] }}</h3>
                <p class="client">Client : <strong>{{ r['clientNom'] }}</strong></p>
              </div>
              <span class="status-badge" [ngClass]="statutClass(r)">{{ statutLabel(r) }}</span>
            </div>
            <p class="resa-date"><mat-icon inline>event</mat-icon> {{ formatDate(r['dateDebut']) }}</p>
            <p class="resa-type" *ngIf="r['typeEvenement']">
              <mat-icon inline>celebration</mat-icon> {{ r['typeEvenement'] }}
              <span *ngIf="r['nombreInvites']"> · {{ r['nombreInvites'] }} invités</span>
            </p>
            <p class="resa-motif" *ngIf="isAnnulee(r) && r['motifAnnulation']">
              <mat-icon inline>info</mat-icon> {{ r['motifAnnulation'] }}
            </p>

            <div class="resa-footer">
              <span class="montant">{{ montant(r) | number }} MAD</span>

              <div class="footer-actions" *ngIf="!isEnAttente(r) || decidingId() !== r['id']">
                <a [routerLink]="['/event', r['salleId']]" class="btn-outline">Voir la salle</a>
                <ng-container *ngIf="isEnAttente(r)">
                  <button type="button" class="btn-approve" (click)="onAccepter(r)" [disabled]="deciding()">
                    <mat-icon inline>check</mat-icon> Accepter
                  </button>
                  <button type="button" class="btn-reject" (click)="decidingId.set(getId(r))">
                    <mat-icon inline>close</mat-icon> Refuser
                  </button>
                </ng-container>
              </div>
            </div>

            <div class="confirm-reject" *ngIf="isEnAttente(r) && decidingId() === r['id']">
              <input type="text" [(ngModel)]="motifInput" placeholder="Motif du refus (optionnel)...">
              <div class="footer-actions">
                <button type="button" class="btn-outline" (click)="decidingId.set(null)">Annuler</button>
                <button type="button" class="btn-reject" (click)="onRefuser(r)" [disabled]="deciding()">Confirmer le refus</button>
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

    .empty-state { text-align: center; padding: 64px 24px; color: #94a3b8; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }

    .list { display: flex; flex-direction: column; gap: 16px; padding-bottom: 48px; }
    .resa-card {
      display: flex; gap: 16px; background: #fff; border: 1px solid #eef0f3;
      border-radius: 14px; padding: 16px;
    }
    .resa-card.pending { border-color: #fed7aa; background: #fffbf5; }
    .resa-image { width: 120px; height: 90px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
    .resa-image img { width: 100%; height: 100%; object-fit: cover; }
    .resa-body { flex: 1; }
    .resa-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .resa-top h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #1e293b; }
    .client { margin: 2px 0 0; font-size: 0.85rem; color: #64748b; }
    .status-badge {
      font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 999px; white-space: nowrap;
    }
    .status-badge.attente { background: #fed7aa; color: #c2410c; }
    .status-badge.avenir { background: #dbeafe; color: #1d4ed8; }
    .status-badge.terminee { background: #dcfce7; color: #15803d; }
    .status-badge.annulee { background: #fee2e2; color: #dc2626; }

    .resa-date, .resa-type, .resa-motif {
      display: flex; align-items: center; gap: 4px; margin: 6px 0 0; font-size: 0.85rem; color: #64748b;
    }
    .resa-date mat-icon, .resa-type mat-icon, .resa-motif mat-icon { font-size: 15px; width: 15px; height: 15px; color: var(--primary); }
    .resa-motif { color: #991b1b; }

    .resa-footer {
      display: flex; align-items: center; justify-content: space-between; margin-top: 12px; flex-wrap: wrap; gap: 10px;
    }
    .footer-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .montant { font-weight: 700; color: var(--accent); font-size: 0.95rem; }
    .btn-outline {
      background: #fff; border: 1px solid #e2e8f0; color: #475569; text-decoration: none;
      border-radius: 8px; padding: 6px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    }
    .btn-approve {
      background: #16a34a; border: none; color: #fff; border-radius: 8px;
      padding: 6px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .btn-reject {
      background: #dc2626; border: none; color: #fff; border-radius: 8px;
      padding: 6px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .btn-approve:disabled, .btn-reject:disabled { opacity: 0.6; cursor: not-allowed; }

    .confirm-reject { margin-top: 12px; }
    .confirm-reject input {
      width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;
      font-family: inherit; font-size: 0.85rem; outline: none; margin-bottom: 8px;
    }

    @media (max-width: 640px) {
      .resa-card { flex-direction: column; }
      .resa-image { width: 100%; height: 140px; }
    }
  `]
})
export class ReservationsProprioComponent {
  loading = signal(true);
  deciding = signal(false);
  decidingId = signal<number | null>(null);
  motifInput = '';
  reservations = signal<ReservationResponse[]>([]);
  filtre = signal<Filtre>('toutes');
  fallbackImg = 'https://images.unsplash.com/photo-1780542900375-0cf459e38fbb?w=400';

  tabs: { key: Filtre; label: string }[] = [
    { key: 'toutes', label: 'Toutes' },
    { key: 'attente', label: 'En attente' },
    { key: 'avenir', label: 'À venir' },
    { key: 'terminees', label: 'Terminées' },
    { key: 'annulees', label: 'Annulées' },
  ];

  counts = computed(() => {
    const list = this.reservations();
    return {
      toutes: list.length,
      attente: list.filter(r => this.isEnAttente(r)).length,
      avenir: list.filter(r => this.isAVenir(r)).length,
      terminees: list.filter(r => this.isTerminee(r)).length,
      annulees: list.filter(r => this.isAnnulee(r)).length,
    };
  });

  filtered = computed(() => {
    const list = this.reservations();
    switch (this.filtre()) {
      case 'attente': return list.filter(r => this.isEnAttente(r));
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
    this.reservationService.getReservationsProprio().subscribe({
      next: (list) => { this.reservations.set(list); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erreur de chargement des réservations', 'Fermer', { duration: 4000 });
      },
    });
  }

  isEnAttente(r: ReservationResponse): boolean {
    return r['statut'] === 'EN_COURS';
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
    if (this.isEnAttente(r)) return 'En attente';
    if (this.isAnnulee(r)) return 'Annulée';
    if (this.isAVenir(r)) return 'À venir';
    if (this.isTerminee(r)) return 'Terminée';
    return String(r['statut'] ?? '');
  }

  statutClass(r: ReservationResponse): string {
    if (this.isEnAttente(r)) return 'attente';
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

  montant(r: ReservationResponse): number {
    return Number(r['montantTotal'] ?? 0);
  }

  getId(r: ReservationResponse): number {
    return r['id'] as number;
  }

  onAccepter(r: ReservationResponse) {
    this.deciding.set(true);
    this.reservationService.accepter(r['id'] as number).subscribe({
      next: () => {
        this.deciding.set(false);
        this.snackBar.open('Réservation acceptée', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => {
        this.deciding.set(false);
        this.snackBar.open("Erreur lors de l'acceptation", 'Fermer', { duration: 4000 });
      },
    });
  }

  onRefuser(r: ReservationResponse) {
    this.deciding.set(true);
    this.reservationService.refuserProprio(r['id'] as number, this.motifInput.trim() || undefined).subscribe({
      next: () => {
        this.deciding.set(false);
        this.decidingId.set(null);
        this.motifInput = '';
        this.snackBar.open('Réservation refusée', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => {
        this.deciding.set(false);
        this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 4000 });
      },
    });
  }
}
