import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalleService, SalleResponse } from '../../../core/services/salle.service';
import { ReservationService, ReservationResponse } from '../../../core/services/reservation.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p class="subtitle">Gérez vos salles et réservations</p>
        </div>
        <a mat-raised-button color="accent" routerLink="/events/create">
          <mat-icon>add</mat-icon>
          Ajouter une salle
        </a>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card primary">
          <mat-icon>meeting_room</mat-icon>
          <div>
            <p class="stat-value">{{ salles.length }}</p>
            <p class="stat-label">Salles</p>
          </div>
        </mat-card>
        <mat-card class="stat-card accent">
          <mat-icon>event</mat-icon>
          <div>
            <p class="stat-value">{{ totalReservations }}</p>
            <p class="stat-label">Réservations</p>
          </div>
        </mat-card>
        <mat-card class="stat-card green">
          <mat-icon>payments</mat-icon>
          <div>
            <p class="stat-value">{{ totalRevenue | number }} MAD</p>
            <p class="stat-label">Revenus</p>
          </div>
        </mat-card>
      </div>

      <!-- Spinner -->
      <div *ngIf="loading" class="spinner-wrap">
        <mat-spinner></mat-spinner>
      </div>

      <!-- Table -->
      <mat-card *ngIf="!loading" class="table-card">
        <mat-card-header>
          <mat-card-title>Mes salles</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="salles" class="events-table">
            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef>Salle</th>
              <td mat-cell *matCellDef="let s">
                <a [routerLink]="['/events', s.id]" class="event-link">{{ s.nom }}</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="ville">
              <th mat-header-cell *matHeaderCellDef>Ville</th>
              <td mat-cell *matCellDef="let s">{{ s.ville }}</td>
            </ng-container>

            <ng-container matColumnDef="capacite">
              <th mat-header-cell *matHeaderCellDef>Capacité</th>
              <td mat-cell *matCellDef="let s">
                <mat-chip color="primary">{{ s.capacite }} pers.</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="prixJour">
              <th mat-header-cell *matHeaderCellDef>Prix / jour</th>
              <td mat-cell *matCellDef="let s">{{ s.prixJour | number }} MAD</td>
            </ng-container>

            <ng-container matColumnDef="note">
              <th mat-header-cell *matHeaderCellDef>Note</th>
              <td mat-cell *matCellDef="let s">
                {{ s.note != null ? (s.note | number:'1.1-1') : '—' }} ({{ s.nbAvis }} avis)
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let s">
                <a mat-icon-button [routerLink]="['/events', s.id]" color="primary">
                  <mat-icon>visibility</mat-icon>
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }
    h1 { margin: 0; font-size: 1.75rem; font-weight: 700; color: #1e293b; }
    .subtitle { margin: 4px 0 0; color: #64748b; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      border-radius: 16px !important;
      border: none !important;
    }
    .stat-card.primary { background: linear-gradient(135deg, #2563EB, #1d4ed8); color: #fff; }
    .stat-card.accent  { background: linear-gradient(135deg, #F97316, #ea580c); color: #fff; }
    .stat-card.green   { background: linear-gradient(135deg, #10b981, #059669); color: #fff; }
    .stat-card mat-icon { font-size: 36px; width: 36px; height: 36px; opacity: 0.85; }
    .stat-value { font-size: 1.5rem; font-weight: 700; margin: 0; }
    .stat-label { font-size: 0.875rem; margin: 0; opacity: 0.85; }
    .spinner-wrap { display: flex; justify-content: center; padding: 64px; }
    .table-card { border-radius: 16px !important; overflow: hidden; }
    .events-table { width: 100%; }
    .event-link { color: var(--primary); font-weight: 600; text-decoration: none; }
    .event-link:hover { text-decoration: underline; }
  `]
})
export class DashboardComponent implements OnInit {
  salles: SalleResponse[] = [];
  reservations: ReservationResponse[] = [];
  loading = true;
  columns = ['nom', 'ville', 'capacite', 'prixJour', 'note', 'actions'];

  // Hypothèse sur les clés du Map<String,Object> renvoyé par le backend :
  // 'montantTotal' et 'statut' d'après l'entité Reservation du rapport.
  // À vérifier/ajuster une fois la vraie réponse JSON observée (onglet Network).
  get totalReservations() {
    return this.reservations.length;
  }

  get totalRevenue() {
    return this.reservations.reduce((sum, r) => {
      const montant = Number(r['montantTotal'] ?? 0);
      const statut = String(r['statut'] ?? '');
      return statut === 'CONFIRMEE' ? sum + montant : sum;
    }, 0);
  }

  constructor(
    private salleService: SalleService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    forkJoin({
      salles: this.salleService.getMesSalles(),
      reservations: this.reservationService.getReservationsProprio(),
    }).subscribe({
      next: ({ salles, reservations }) => {
        this.salles = salles;
        this.reservations = reservations;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur de chargement du tableau de bord', 'Fermer', { duration: 4000 });
      },
    });
  }
}
