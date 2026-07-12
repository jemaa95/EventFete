import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalleService, SalleResponse } from '../../../core/services/salle.service';
import { ReservationService, ReservationResponse } from '../../../core/services/reservation.service';
import { UserService, UserProfile } from '../../../core/services/user.service';
import { KycService } from '../../../core/services/kyc.service';
import { forkJoin } from 'rxjs';

const DOCUMENTS_DISPONIBLES = ["Carte d'identité", 'Licence commerciale', 'Certificat fiscal'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-container">

      <div *ngIf="loading()" class="spinner-wrap">
        <mat-spinner></mat-spinner>
      </div>

      <ng-container *ngIf="!loading() && profile() as p">

        <!-- BANNIÈRE KYC : tant que le dossier n'est pas approuvé -->
        <div class="kyc-banner" *ngIf="p.kycStatut !== 'APPROUVEE'">
          <div class="kyc-header">
            <mat-icon>shield</mat-icon>
            <div>
              <h2>Validation KYC requise</h2>
              <p>Vous devez faire valider votre dossier avant de pouvoir publier des salles.</p>
            </div>
          </div>

          <div class="kyc-status" [ngSwitch]="p.kycStatut">
            <div *ngSwitchCase="'EN_ATTENTE'" class="status-pending">
              <mat-icon>schedule</mat-icon>
              Votre dossier ({{ p.entreprise }}) est en cours d'examen par un administrateur.
            </div>

            <div *ngSwitchCase="'REJETEE'" class="status-rejected">
              <mat-icon>cancel</mat-icon>
              <div>
                <strong>Dossier rejeté.</strong>
                <p>{{ p.motifRejetKyc }}</p>
              </div>
            </div>

            <form *ngSwitchDefault class="kyc-form" (ngSubmit)="onSoumettreKyc()">
              <label>Nom de l'entreprise</label>
              <input type="text" [(ngModel)]="entreprise" name="entreprise" placeholder="Ex: Événements Laurent">

              <label>Documents fournis</label>
              <div class="doc-checks">
                <label class="doc-check" *ngFor="let d of documentsDisponibles">
                  <input type="checkbox" [checked]="documentsChoisis.includes(d)" (change)="toggleDocument(d)">
                  {{ d }}
                </label>
              </div>

              <button type="submit" class="submit-btn" [disabled]="!entreprise || documentsChoisis.length === 0 || submitting()">
                <mat-spinner *ngIf="submitting()" diameter="18"></mat-spinner>
                <span *ngIf="!submitting()">Soumettre mon dossier KYC</span>
              </button>
            </form>

            <form *ngSwitchCase="'REJETEE'" class="kyc-form" (ngSubmit)="onSoumettreKyc()">
              <label>Nom de l'entreprise</label>
              <input type="text" [(ngModel)]="entreprise" name="entreprise2" placeholder="Ex: Événements Laurent">
              <label>Documents fournis</label>
              <div class="doc-checks">
                <label class="doc-check" *ngFor="let d of documentsDisponibles">
                  <input type="checkbox" [checked]="documentsChoisis.includes(d)" (change)="toggleDocument(d)">
                  {{ d }}
                </label>
              </div>
              <button type="submit" class="submit-btn" [disabled]="!entreprise || documentsChoisis.length === 0 || submitting()">
                <mat-spinner *ngIf="submitting()" diameter="18"></mat-spinner>
                <span *ngIf="!submitting()">Soumettre à nouveau</span>
              </button>
            </form>
          </div>
        </div>

        <!-- DASHBOARD COMPLET : uniquement si KYC approuvé -->
        <ng-container *ngIf="p.kycStatut === 'APPROUVEE'">
          <div class="page-header">
            <div>
              <h1>Tableau de bord Propriétaire</h1>
              <p class="subtitle">Gérez vos salles et suivez vos revenus</p>
            </div>
            <a [routerLink]="'/create-event'" class="add-btn">
              <mat-icon>add</mat-icon> Ajouter une salle
            </a>
          </div>

          <div class="stats-grid">
            <div class="stat-card grad-purple">
              <span class="stat-label">Revenu total</span>
              <span class="stat-value">{{ revenuTotal() | number }} MAD</span>
            </div>
            <div class="stat-card grad-pink">
              <span class="stat-label">Réservations</span>
              <span class="stat-value">{{ reservations().length }}</span>
            </div>
            <div class="stat-card grad-blue">
              <span class="stat-label">Salles actives</span>
              <span class="stat-value">{{ salles().length }}</span>
            </div>
            <div class="stat-card grad-green">
              <span class="stat-label">Note moyenne</span>
              <span class="stat-value">{{ noteMoyenne() }}</span>
            </div>
          </div>

          <div class="main-grid">
            <div class="col-main">
              <div class="card">
                <div class="card-header">
                  <h3>Prochaines réservations</h3>
                </div>
                <div class="resa-row" *ngFor="let r of prochainesReservations()">
                  <div>
                    <strong>{{ r['salleNom'] }}</strong>
                    <p class="muted">Client : {{ r['clientNom'] }}</p>
                  </div>
                  <div class="resa-meta">
                    <span class="muted">{{ formatDate(r['dateDebut']) }}</span>
                    <span class="montant">{{ montant(r) | number }} MAD</span>
                  </div>
                </div>
                <p *ngIf="prochainesReservations().length === 0" class="muted empty">Aucune réservation à venir.</p>
              </div>

              <div class="card">
                <h3>Revenus mensuels</h3>
                <div class="chart">
                  <div class="bar-col" *ngFor="let m of revenusMensuels()">
                    <div class="bar" [style.height.%]="m.pct"></div>
                    <span class="bar-label">{{ m.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-side">
              <div class="card">
                <h3>Mes salles</h3>
                <div class="salle-mini" *ngFor="let s of salles()">
                  <strong>{{ s.nom }}</strong>
                  <p class="muted">{{ s.ville }}</p>
                  <div class="mini-stats">
                    <span>Réservations<br><strong>{{ countReservations(s.id) }}</strong></span>
                    <span>Note<br><strong>★ {{ s.note != null ? (s.note | number:'1.1-1') : '—' }}</strong></span>
                    <span>Revenus<br><strong>{{ revenusSalle(s.id) | number }} MAD</strong></span>
                  </div>
                  <a [routerLink]="['/event', s.id]" class="gerer-btn">Gérer</a>
                </div>
              </div>

              <div class="card tips-card">
                <h3>Conseils</h3>
                <ul>
                  <li>Répondez rapidement aux demandes pour améliorer votre taux de conversion</li>
                  <li>Ajoutez plus de photos pour attirer plus de clients</li>
                  <li>Mettez à jour vos disponibilités régulièrement</li>
                </ul>
              </div>
            </div>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .spinner-wrap { display: flex; justify-content: center; padding: 64px; }

    .kyc-banner { background: #fff; border: 1px solid #eef0f3; border-radius: 16px; padding: 24px; margin: 24px 0; }
    .kyc-header { display: flex; gap: 12px; margin-bottom: 16px; }
    .kyc-header mat-icon { color: var(--primary); font-size: 28px; width: 28px; height: 28px; }
    .kyc-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .kyc-header p { margin: 2px 0 0; color: #64748b; font-size: 0.88rem; }

    .status-pending, .status-rejected {
      display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-radius: 10px; font-size: 0.88rem;
    }
    .status-pending { background: #fff7ed; color: #c2410c; }
    .status-rejected { background: #fef2f2; color: #991b1b; align-items: flex-start; }
    .status-rejected p { margin: 4px 0 0; }

    .kyc-form { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
    .kyc-form label { font-size: 0.8rem; color: #64748b; margin-top: 8px; }
    .kyc-form input[type=text] {
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px; font-family: inherit; font-size: 0.9rem;
    }
    .doc-checks { display: flex; flex-direction: column; gap: 6px; }
    .doc-check { display: flex; align-items: center; gap: 8px; font-size: 0.87rem; color: #334155; font-weight: 400; }
    .submit-btn {
      margin-top: 16px; height: 44px; border: none; border-radius: 10px; background: var(--gradient);
      color: #fff; font-weight: 700; font-size: 0.9rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px; align-self: flex-start; padding: 0 24px;
    }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .page-header { display: flex; align-items: center; justify-content: space-between; margin: 24px 0; flex-wrap: wrap; gap: 16px; }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .subtitle { margin: 2px 0 0; color: #64748b; }
    .add-btn {
      background: var(--gradient); color: #fff; text-decoration: none; border-radius: 10px;
      padding: 10px 20px; font-weight: 700; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 6px;
    }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .stat-card { border-radius: 14px; padding: 20px; color: #fff; display: flex; flex-direction: column; gap: 4px; }
    .grad-purple { background: linear-gradient(135deg, #9333EA, #7e22ce); }
    .grad-pink { background: linear-gradient(135deg, #EC4899, #db2777); }
    .grad-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .grad-green { background: linear-gradient(135deg, #10b981, #059669); }
    .stat-label { font-size: 0.82rem; opacity: 0.9; }
    .stat-value { font-size: 1.5rem; font-weight: 800; }

    .main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; padding-bottom: 48px; }
    .col-main { display: flex; flex-direction: column; gap: 20px; }
    .col-side { display: flex; flex-direction: column; gap: 20px; }
    .card { background: #fff; border: 1px solid #eef0f3; border-radius: 16px; padding: 22px; }
    .card h3 { margin: 0 0 14px; font-size: 1rem; font-weight: 700; color: #1e293b; }
    .muted { color: #94a3b8; font-size: 0.82rem; margin: 2px 0 0; }
    .empty { padding: 16px 0; }

    .resa-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .resa-row:last-child { border-bottom: none; }
    .resa-meta { text-align: right; }
    .montant { display: block; font-weight: 700; color: var(--primary); }

    .chart { display: flex; align-items: flex-end; gap: 12px; height: 140px; padding-top: 12px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 6px; }
    .bar { width: 100%; max-width: 32px; background: var(--gradient); border-radius: 6px 6px 0 0; min-height: 4px; }
    .bar-label { font-size: 0.72rem; color: #94a3b8; }

    .salle-mini { border-bottom: 1px solid #f1f5f9; padding: 14px 0; }
    .salle-mini:last-child { border-bottom: none; }
    .salle-mini strong { font-size: 0.92rem; color: #1e293b; }
    .mini-stats { display: flex; justify-content: space-between; margin: 10px 0; font-size: 0.75rem; color: #94a3b8; text-align: center; }
    .mini-stats strong { color: #1e293b; font-size: 0.85rem; }
    .gerer-btn {
      display: block; text-align: center; background: #f8fafc; color: var(--primary); text-decoration: none;
      border-radius: 8px; padding: 8px; font-size: 0.85rem; font-weight: 600;
    }

    .tips-card ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
    .tips-card li { font-size: 0.82rem; color: #475569; padding-left: 14px; position: relative; }
    .tips-card li::before { content: '•'; color: var(--accent); position: absolute; left: 0; font-weight: 700; }

    @media (max-width: 900px) {
      .main-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent {
  loading = signal(true);
  submitting = signal(false);
  profile = signal<UserProfile | null>(null);
  salles = signal<SalleResponse[]>([]);
  reservations = signal<ReservationResponse[]>([]);

  documentsDisponibles = DOCUMENTS_DISPONIBLES;
  entreprise = '';
  documentsChoisis: string[] = [];

  revenuTotal = computed(() =>
    this.reservations()
      .filter(r => r['statut'] === 'CONFIRMEE')
      .reduce((sum, r) => sum + Number(r['montantTotal'] ?? 0), 0)
  );

  noteMoyenne = computed(() => {
    const notes = this.salles().map(s => s.note).filter((n): n is number => n != null);
    if (notes.length === 0) return '—';
    return (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2);
  });

  prochainesReservations = computed(() =>
    this.reservations()
      .filter(r => new Date(r['dateDebut'] as string) > new Date())
      .sort((a, b) => new Date(a['dateDebut'] as string).getTime() - new Date(b['dateDebut'] as string).getTime())
      .slice(0, 4)
  );

  revenusMensuels = computed(() => {
    const now = new Date();
    const months: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleDateString('fr-FR', { month: 'short' }), total: 0 });
    }
    this.reservations()
      .filter(r => r['statut'] === 'CONFIRMEE')
      .forEach(r => {
        const d = new Date(r['dateDebut'] as string);
        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        if (diffMonths >= 0 && diffMonths <= 5) {
          months[5 - diffMonths].total += Number(r['montantTotal'] ?? 0);
        }
      });
    const max = Math.max(...months.map(m => m.total), 1);
    return months.map(m => ({ label: m.label, pct: Math.max((m.total / max) * 100, 2) }));
  });

  constructor(
    private salleService: SalleService,
    private reservationService: ReservationService,
    private userService: UserService,
    private kycService: KycService,
    private snackBar: MatSnackBar,
  ) {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.userService.getProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.entreprise = p.entreprise ?? '';

        if (p.kycStatut === 'APPROUVEE') {
          this.loadDashboardData();
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erreur de chargement du profil', 'Fermer', { duration: 4000 });
      },
    });
  }

  private loadDashboardData() {
    forkJoin({
      salles: this.salleService.getMesSalles(),
      reservations: this.reservationService.getReservationsProprio(),
    }).subscribe({
      next: ({ salles, reservations }) => {
        this.salles.set(salles);
        this.reservations.set(reservations);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erreur de chargement du tableau de bord', 'Fermer', { duration: 4000 });
      },
    });
  }

  toggleDocument(doc: string) {
    this.documentsChoisis = this.documentsChoisis.includes(doc)
      ? this.documentsChoisis.filter(d => d !== doc)
      : [...this.documentsChoisis, doc];
  }

  onSoumettreKyc() {
    if (!this.entreprise || this.documentsChoisis.length === 0) return;
    this.submitting.set(true);

    this.kycService.soumettre({ entreprise: this.entreprise, documents: this.documentsChoisis }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Dossier KYC soumis, en attente de validation', 'OK', { duration: 4000 });
        this.load();
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open('Erreur lors de la soumission du dossier KYC', 'Fermer', { duration: 4000 });
      },
    });
  }

  countReservations(salleId: number): number {
    return this.reservations().filter(r => r['salleId'] === salleId).length;
  }

  revenusSalle(salleId: number): number {
    return this.reservations()
      .filter(r => r['salleId'] === salleId && r['statut'] === 'CONFIRMEE')
      .reduce((sum, r) => sum + Number(r['montantTotal'] ?? 0), 0);
  }

  montant(r: ReservationResponse): number {
    return Number(r['montantTotal'] ?? 0);
  }

  formatDate(date: unknown): string {
    if (!date) return '';
    return new Date(date as string).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
