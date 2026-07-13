import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { KycService, UserAdminResponse } from '../../../core/services/kyc.service';

type Filtre = 'toutes' | 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';

@Component({
  selector: 'app-admin-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="header-row">
        <mat-icon class="shield-icon">shield</mat-icon>
        <div>
          <h1>KYC administratif</h1>
          <p class="subtitle">Gérez les demandes de validation des propriétaires</p>
        </div>
      </div>

      <div class="tabs-nav">
        <a routerLink="/admin" class="tab-link active">KYC propriétaires</a>
        <a routerLink="/admin/salles" class="tab-link">Salles à valider</a>
      </div>

      <div class="stats-grid">
        <div class="stat-card orange">
          <div><span class="stat-label">En attente</span><span class="stat-value">{{ counts().enAttente }}</span></div>
          <mat-icon>schedule</mat-icon>
        </div>
        <div class="stat-card green">
          <div><span class="stat-label">Approuvées</span><span class="stat-value">{{ counts().approuvees }}</span></div>
          <mat-icon>check_circle</mat-icon>
        </div>
        <div class="stat-card red">
          <div><span class="stat-label">Rejetées</span><span class="stat-value">{{ counts().rejetees }}</span></div>
          <mat-icon>cancel</mat-icon>
        </div>
        <div class="stat-card purple">
          <div><span class="stat-label">Total</span><span class="stat-value">{{ counts().total }}</span></div>
          <mat-icon>description</mat-icon>
        </div>
      </div>

      <div class="list-card">
        <div class="list-header">
          <h2>Demandes de validation</h2>
          <div class="tabs">
            <button *ngFor="let t of tabs" type="button" class="tab"
              [class.active]="filtre() === t.key" (click)="filtre.set(t.key)">
              {{ t.label }}
            </button>
          </div>
        </div>

        <div *ngIf="loading()" class="spinner-wrap">
          <mat-spinner></mat-spinner>
        </div>

        <div *ngIf="!loading() && filtered().length === 0" class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Aucune demande dans cette catégorie.</p>
        </div>

        <div class="demande-card" *ngFor="let u of filtered()">
          <div class="demande-top">
            <div class="demande-identity">
              <div class="avatar"><mat-icon>person</mat-icon></div>
              <div>
                <strong>{{ u.prenom }} {{ u.nom }}</strong>
                <p class="entreprise">{{ u.entreprise }}</p>
              </div>
            </div>
            <span class="status-badge" [ngClass]="badgeClass(u.kycStatut)">{{ statutLabel(u.kycStatut) }}</span>
          </div>

          <div class="demande-details">
            <div>
              <span class="label">E-mail</span>
              <span class="value">{{ u.email }}</span>
            </div>
            <div>
              <span class="label">Téléphone</span>
              <span class="value">{{ u.telephone }}</span>
            </div>
            <div>
              <span class="label">Date de soumission</span>
              <span class="value">{{ formatDate(u.dateSoumissionKyc) }}</span>
            </div>
          </div>

          <div class="documents-row" *ngIf="u.documentsKyc?.length">
            <span class="label">Documents fournis</span>
            <div class="chips">
              <span class="chip" *ngFor="let d of u.documentsKyc"><mat-icon inline>description</mat-icon> {{ d }}</span>
            </div>
          </div>

          <div class="rejet-box" *ngIf="u.kycStatut === 'REJETEE' && u.motifRejetKyc">
            <strong>Raison du rejet :</strong> {{ u.motifRejetKyc }}
          </div>

          <div class="actions-row" *ngIf="u.kycStatut === 'EN_ATTENTE'">
            <ng-container *ngIf="rejectingId() !== u.id">
              <button type="button" class="btn-approve" (click)="onApprouver(u)">
                <mat-icon inline>check</mat-icon> Approuver
              </button>
              <button type="button" class="btn-reject" (click)="rejectingId.set(u.id); motifInput = ''">
                <mat-icon inline>close</mat-icon> Rejeter
              </button>
            </ng-container>

            <div class="reject-form" *ngIf="rejectingId() === u.id">
              <input type="text" [(ngModel)]="motifInput" placeholder="Motif du rejet...">
              <button type="button" class="btn-reject" (click)="onRejeter(u)">Confirmer le rejet</button>
              <button type="button" class="btn-cancel" (click)="rejectingId.set(null)">Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; align-items: center; gap: 12px; margin: 24px 0 20px; }
    .shield-icon { color: var(--primary); font-size: 32px; width: 32px; height: 32px; }
    h1 { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin: 0; }
    .subtitle { color: #64748b; margin: 2px 0 0; font-size: 0.9rem; }

    .tabs-nav { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #eef0f3; }
    .tab-link {
      padding: 10px 18px; text-decoration: none; color: #64748b; font-weight: 600; font-size: 0.9rem;
      border-bottom: 2px solid transparent;
    }
    .tab-link.active { color: var(--primary); border-bottom-color: var(--primary); }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }
    .stat-card {
      display: flex; align-items: center; justify-content: space-between;
      background: #fff; border-radius: 14px; padding: 18px 20px; border-left: 4px solid;
    }
    .stat-card.orange { border-color: #f97316; }
    .stat-card.green { border-color: #16a34a; }
    .stat-card.red { border-color: #dc2626; }
    .stat-card.purple { border-color: var(--primary); }
    .stat-label { display: block; font-size: 0.8rem; color: #64748b; }
    .stat-value { display: block; font-size: 1.5rem; font-weight: 800; color: #1e293b; }
    .stat-card mat-icon { color: #cbd5e1; font-size: 26px; width: 26px; height: 26px; }

    .list-card { background: #fff; border: 1px solid #eef0f3; border-radius: 16px; padding: 24px; }
    .list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .list-header h2 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #1e293b; }
    .tabs { display: flex; gap: 6px; background: #f8fafc; border-radius: 10px; padding: 4px; }
    .tab {
      border: none; background: transparent; padding: 6px 14px; border-radius: 8px;
      font-size: 0.82rem; font-weight: 600; color: #64748b; cursor: pointer;
    }
    .tab.active { background: var(--gradient); color: #fff; }

    .spinner-wrap { display: flex; justify-content: center; padding: 48px; }
    .empty-state { text-align: center; padding: 48px 24px; color: #94a3b8; }
    .empty-state mat-icon { font-size: 40px; width: 40px; height: 40px; margin-bottom: 8px; }

    .demande-card { border: 1px solid #eef0f3; border-radius: 14px; padding: 18px; margin-top: 14px; }
    .demande-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .demande-identity { display: flex; align-items: center; gap: 10px; }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%; background: var(--nav-active-bg);
      display: flex; align-items: center; justify-content: center; color: var(--primary);
    }
    .demande-identity strong { font-size: 0.95rem; color: #1e293b; }
    .entreprise { margin: 1px 0 0; font-size: 0.8rem; color: #64748b; }

    .status-badge { font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 999px; }
    .status-badge.badge-attente { background: #fed7aa; color: #c2410c; }
    .status-badge.badge-approuvee { background: #dcfce7; color: #15803d; }
    .status-badge.badge-rejetee { background: #fee2e2; color: #dc2626; }

    .demande-details { display: flex; gap: 32px; margin-top: 12px; flex-wrap: wrap; }
    .demande-details .label, .documents-row .label { display: block; font-size: 0.72rem; color: #94a3b8; }
    .demande-details .value { font-size: 0.85rem; color: #334155; font-weight: 500; }

    .documents-row { margin-top: 10px; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
    .chip {
      display: inline-flex; align-items: center; gap: 4px; background: var(--nav-active-bg);
      color: var(--primary); font-size: 0.78rem; font-weight: 600; padding: 4px 10px; border-radius: 999px;
    }

    .rejet-box {
      margin-top: 12px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;
      border-radius: 10px; padding: 10px 14px; font-size: 0.85rem;
    }

    .actions-row { display: flex; gap: 10px; margin-top: 14px; }
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
    .reject-form { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
    .reject-form input {
      flex: 1; min-width: 200px; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 8px 12px; font-family: inherit; font-size: 0.85rem; outline: none;
    }

    @media (max-width: 640px) {
      .demande-details { gap: 16px; }
      .actions-row, .reject-form { flex-direction: column; }
    }
  `]
})
export class AdminKycComponent {
  loading = signal(true);
  demandes = signal<UserAdminResponse[]>([]);
  filtre = signal<Filtre>('toutes');
  rejectingId = signal<number | null>(null);
  motifInput = '';

  tabs: { key: Filtre; label: string }[] = [
    { key: 'toutes', label: 'Toutes' },
    { key: 'EN_ATTENTE', label: 'En attente' },
    { key: 'APPROUVEE', label: 'Approuvées' },
    { key: 'REJETEE', label: 'Rejetées' },
  ];

  counts = computed(() => {
    const list = this.demandes();
    return {
      enAttente: list.filter(u => u.kycStatut === 'EN_ATTENTE').length,
      approuvees: list.filter(u => u.kycStatut === 'APPROUVEE').length,
      rejetees: list.filter(u => u.kycStatut === 'REJETEE').length,
      total: list.length,
    };
  });

  filtered = computed(() => {
    const list = this.demandes();
    return this.filtre() === 'toutes' ? list : list.filter(u => u.kycStatut === this.filtre());
  });

  constructor(
    private kycService: KycService,
    private snackBar: MatSnackBar,
  ) {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.kycService.listerDemandes().subscribe({
      next: (list) => { this.demandes.set(list); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erreur de chargement des demandes KYC', 'Fermer', { duration: 4000 });
      },
    });
  }

  statutLabel(s: KycStatutLike): string {
    switch (s) {
      case 'EN_ATTENTE': return 'En attente';
      case 'APPROUVEE': return 'Approuvée';
      case 'REJETEE': return 'Rejetée';
      default: return s;
    }
  }

  badgeClass(s: KycStatutLike): string {
    switch (s) {
      case 'EN_ATTENTE': return 'badge-attente';
      case 'APPROUVEE': return 'badge-approuvee';
      case 'REJETEE': return 'badge-rejetee';
      default: return '';
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  onApprouver(u: UserAdminResponse) {
    this.kycService.approuver(u.id).subscribe({
      next: () => {
        this.snackBar.open(`${u.prenom} ${u.nom} approuvé(e)`, 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open("Erreur lors de l'approbation", 'Fermer', { duration: 4000 }),
    });
  }

  onRejeter(u: UserAdminResponse) {
    if (!this.motifInput.trim()) {
      this.snackBar.open('Merci de préciser un motif', 'Fermer', { duration: 3000 });
      return;
    }
    this.kycService.rejeter(u.id, this.motifInput.trim()).subscribe({
      next: () => {
        this.rejectingId.set(null);
        this.snackBar.open(`Demande de ${u.prenom} ${u.nom} rejetée`, 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erreur lors du rejet', 'Fermer', { duration: 4000 }),
    });
  }
}

type KycStatutLike = 'NON_SOUMIS' | 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';
