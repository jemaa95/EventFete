import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventService, Event } from '../../../core/services/event.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatListModule, MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <a mat-button routerLink="/dashboard" color="primary" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Retour
      </a>

      <div *ngIf="loading" class="spinner-wrap">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="event && !loading" class="event-layout">
        <div class="event-main">
          <div class="event-image">
            <img [src]="event.imageUrl || 'https://images.unsplash.com/photo-1780542900375-0cf459e38fbb?w=800'" [alt]="event.title">
          </div>

          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title class="event-title">{{ event.title }}</mat-card-title>
              <mat-card-subtitle>Organisé par {{ event.organizer }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="description">{{ event.description }}</p>

              <mat-list class="details-list">
                <mat-list-item>
                  <mat-icon matListItemIcon color="primary">calendar_today</mat-icon>
                  <span>{{ event.date | date:'EEEE dd MMMM yyyy' }}</span>
                </mat-list-item>
                <mat-list-item>
                  <mat-icon matListItemIcon color="primary">location_on</mat-icon>
                  <span>{{ event.location }}</span>
                </mat-list-item>
                <mat-list-item>
                  <mat-icon matListItemIcon color="primary">people</mat-icon>
                  <span>{{ event.bookedCount }} / {{ event.capacity }} places réservées</span>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="event-sidebar">
          <mat-card class="booking-card">
            <mat-card-content>
              <div class="price">
                <span class="price-value">{{ event.price | number }} MAD</span>
                <span class="price-label">/personne</span>
              </div>

              <div class="capacity-bar">
                <div class="capacity-fill"
                  [style.width.%]="(event.bookedCount / event.capacity) * 100">
                </div>
              </div>
              <p class="capacity-text">
                {{ event.capacity - event.bookedCount }} places restantes
              </p>

              <button
                mat-raised-button color="accent"
                class="book-btn"
                [disabled]="booking || event.bookedCount >= event.capacity"
                (click)="onBook()"
              >
                <mat-spinner *ngIf="booking" diameter="20"></mat-spinner>
                <span *ngIf="!booking">
                  <mat-icon>confirmation_number</mat-icon>
                  Réserver maintenant
                </span>
              </button>

              <div class="guarantees">
                <div class="guarantee"><mat-icon>verified</mat-icon> Confirmation instantanée</div>
                <div class="guarantee"><mat-icon>cancel</mat-icon> Annulation gratuite 48h avant</div>
                <div class="guarantee"><mat-icon>lock</mat-icon> Paiement sécurisé</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-btn { margin-bottom: 16px; }
    .spinner-wrap { display: flex; justify-content: center; padding: 64px; }
    .event-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
      align-items: start;
    }
    .event-image img {
      width: 100%;
      height: 360px;
      object-fit: cover;
      border-radius: 16px;
      margin-bottom: 16px;
    }
    .info-card { border-radius: 16px !important; }
    .event-title { font-size: 1.5rem !important; font-weight: 700 !important; }
    .description { color: #475569; line-height: 1.7; margin: 16px 0; }
    .details-list mat-list-item { height: auto !important; padding: 8px 0 !important; }

    .booking-card { border-radius: 16px !important; position: sticky; top: 88px; }
    .price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 16px; }
    .price-value { font-size: 2rem; font-weight: 700; color: var(--primary); }
    .price-label { color: #64748b; }
    .capacity-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .capacity-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 4px;
      transition: width 0.4s;
    }
    .capacity-text { font-size: 0.875rem; color: #64748b; margin-bottom: 20px; }
    .book-btn {
      width: 100%;
      height: 52px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    .guarantees { display: flex; flex-direction: column; gap: 10px; }
    .guarantee {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #475569;
    }
    .guarantee mat-icon { font-size: 18px; width: 18px; height: 18px; color: #10b981; }

    @media (max-width: 900px) {
      .event-layout { grid-template-columns: 1fr; }
      .booking-card { position: static; }
    }
  `]
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  booking = false;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getById(id).subscribe({
      next: data => { this.event = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onBook() {
    if (!this.event) return;
    this.booking = true;
    this.eventService.book(this.event.id).subscribe({
      next: () => {
        this.snackBar.open('Réservation confirmée !', 'OK', { duration: 4000 });
        this.event!.bookedCount++;
        this.booking = false;
      },
      error: () => {
        this.booking = false;
        this.snackBar.open('Erreur lors de la réservation', 'Fermer', { duration: 4000 });
      },
    });
  }
}