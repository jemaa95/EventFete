import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { map, startWith } from 'rxjs/operators';
import { SalleService, SalleResponse } from '../../../core/services/salle.service';
import { AvisService, AvisResponse } from '../../../core/services/avis.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, FormsModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <a routerLink="/chercheur" class="back-link">
        <mat-icon>arrow_back</mat-icon> Retour aux résultats
      </a>

      <div *ngIf="loading()" class="spinner-wrap">
        <mat-spinner></mat-spinner>
      </div>

      <ng-container *ngIf="salle() as s">
        <div class="header-row">
          <div>
            <h1>{{ s.nom }}</h1>
            <p class="location"><mat-icon inline>location_on</mat-icon> {{ s.adresse }}, {{ s.ville }}</p>
          </div>
          <span class="rating-badge" *ngIf="s.note != null">
            <mat-icon inline>star</mat-icon> {{ s.note | number:'1.1-1' }} ({{ s.nbAvis }} avis)
          </span>
        </div>

        <div class="event-layout">
          <div class="event-main">
            <div class="gallery">
              <div class="gallery-main">
                <img [src]="s.photos?.[0] || fallbackImg" [alt]="s.nom">
              </div>
              <div class="gallery-thumbs" *ngIf="s.photos && s.photos.length > 1">
                <div class="thumb" *ngFor="let p of s.photos.slice(1, 3)">
                  <img [src]="p" [alt]="s.nom">
                </div>
                <div class="thumb more" *ngIf="s.photos.length > 3">
                  +{{ s.photos.length - 3 }} photos
                </div>
              </div>
            </div>

            <div class="info-card">
              <h2>Description</h2>
              <p class="description">{{ s.description }}</p>
            </div>

            <div class="info-card">
              <h2>Avis clients ({{ avisList().length }})</h2>

              <p *ngIf="avisList().length === 0" class="no-avis">
                Aucun avis pour le moment.
              </p>

              <div class="avis-item" *ngFor="let a of avisList()">
                <div class="avis-top">
                  <strong>{{ a.clientNom }}</strong>
                  <span class="avis-stars">
                    <mat-icon *ngFor="let i of [1,2,3,4,5]" inline
                      [class.filled]="i <= a.note">star</mat-icon>
                  </span>
                </div>
                <p class="avis-comment" *ngIf="a.commentaire">{{ a.commentaire }}</p>
                <span class="avis-date">{{ formatDate(a.createdAt) }}</span>

                <div class="reponse-proprio" *ngIf="a.reponseProprio">
                  <mat-icon inline>storefront</mat-icon>
                  <div>
                    <strong>Réponse du propriétaire</strong>
                    <p>{{ a.reponseProprio }}</p>
                  </div>
                </div>

                <!-- Simplification : le formulaire de réponse est visible pour tout
                     compte ROLE_PROPRIO n'ayant pas déjà répondu ; le backend vérifie
                     réellement que c'est bien le propriétaire de CETTE salle (403 sinon). -->
                <div class="reply-form" *ngIf="!a.reponseProprio && isProprio()">
                  <ng-container *ngIf="replyingId() !== a.id">
                    <button type="button" class="reply-btn" (click)="replyingId.set(a.id)">
                      Répondre à cet avis
                    </button>
                  </ng-container>
                  <ng-container *ngIf="replyingId() === a.id">
                    <textarea [(ngModel)]="replyText" rows="2" placeholder="Votre réponse..."></textarea>
                    <div class="reply-actions">
                      <button type="button" class="btn-outline" (click)="replyingId.set(null)">Annuler</button>
                      <button type="button" class="btn-primary" (click)="onRepondre(a)">Publier la réponse</button>
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>
          </div>

          <div class="event-sidebar">
            <div class="booking-card">
              <div class="price-row">
                <span class="price-value">{{ s.prixJour | number }} MAD</span>
                <span class="price-label">/jour</span>
              </div>
              <p class="capacite-row"><mat-icon inline>people</mat-icon> Capacité : {{ s.capacite }} personnes</p>

              <form [formGroup]="form" (ngSubmit)="onBook()" class="booking-form">
                <label>Date de réservation</label>
                <input type="date" formControlName="dateDebut">

                <label>Nombre de jours</label>
                <input type="number" min="1" formControlName="nbJours">

                <button type="submit" class="book-btn" [disabled]="(formInvalid$ | async)">
                  Réserver maintenant
                </button>
              </form>

              <ul class="guarantees">
                <li><mat-icon inline>check_circle</mat-icon> Annulation gratuite 48h avant</li>
                <li><mat-icon inline>check_circle</mat-icon> Confirmation instantanée</li>
                <li><mat-icon inline>check_circle</mat-icon> Paiement sécurisé</li>
              </ul>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--primary); text-decoration: none; font-size: 0.9rem;
      margin: 16px 0;
    }
    .spinner-wrap { display: flex; justify-content: center; padding: 64px; }

    .header-row {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
    }
    h1 { margin: 0 0 4px; font-size: 1.6rem; font-weight: 800; color: #1e1b2e; }
    .location { margin: 0; color: #64748b; font-size: 0.9rem; display: flex; align-items: center; gap: 4px; }
    .location mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--primary); }
    .rating-badge {
      background: #fffbeb; color: #b45309; font-weight: 700; font-size: 0.9rem;
      padding: 6px 14px; border-radius: 999px; display: flex; align-items: center; gap: 4px;
      height: fit-content;
    }
    .rating-badge mat-icon { font-size: 18px; width: 18px; height: 18px; color: #f59e0b; }

    .event-layout {
      display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start;
      padding-bottom: 48px;
    }
    .gallery { margin-bottom: 20px; }
    .gallery-main { border-radius: 16px; overflow: hidden; height: 360px; }
    .gallery-main img { width: 100%; height: 100%; object-fit: cover; }
    .gallery-thumbs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
    .thumb { border-radius: 10px; overflow: hidden; height: 80px; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb.more {
      display: flex; align-items: center; justify-content: center;
      background: var(--nav-active-bg); color: var(--primary); font-weight: 700; font-size: 0.85rem;
    }

    .info-card {
      background: #fff; border: 1px solid #eef0f3; border-radius: 16px; padding: 24px;
    }
    .info-card h2 { margin: 0 0 12px; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .description { color: #475569; line-height: 1.7; margin: 0; }

    .no-avis { color: #94a3b8; font-size: 0.9rem; }
    .avis-item { border-top: 1px solid #f1f5f9; padding: 16px 0; }
    .avis-item:first-of-type { border-top: none; padding-top: 0; }
    .avis-top { display: flex; align-items: center; justify-content: space-between; }
    .avis-top strong { font-size: 0.92rem; color: #1e293b; }
    .avis-stars mat-icon { font-size: 16px; width: 16px; height: 16px; color: #e2e8f0; }
    .avis-stars mat-icon.filled { color: #f59e0b; }
    .avis-comment { margin: 6px 0 4px; color: #475569; font-size: 0.88rem; line-height: 1.5; }
    .avis-date { font-size: 0.75rem; color: #94a3b8; }

    .reponse-proprio {
      display: flex; gap: 8px; margin-top: 10px; background: var(--nav-active-bg);
      border-radius: 10px; padding: 10px 12px;
    }
    .reponse-proprio mat-icon { color: var(--primary); font-size: 18px; width: 18px; height: 18px; }
    .reponse-proprio strong { font-size: 0.82rem; color: var(--primary); display: block; margin-bottom: 2px; }
    .reponse-proprio p { margin: 0; font-size: 0.85rem; color: #475569; }

    .reply-form { margin-top: 10px; }
    .reply-btn {
      background: none; border: none; color: var(--primary); font-weight: 600;
      font-size: 0.82rem; cursor: pointer; padding: 0;
    }
    .reply-form textarea {
      width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;
      font-family: inherit; font-size: 0.85rem; resize: vertical; outline: none;
    }
    .reply-actions { display: flex; gap: 8px; margin-top: 8px; }

    .booking-card {
      background: #fff; border: 1px solid #eef0f3; border-radius: 16px; padding: 24px;
      position: sticky; top: 88px;
    }
    .price-row { display: flex; align-items: baseline; gap: 6px; }
    .price-value { font-size: 1.6rem; font-weight: 800; color: #1e1b2e; }
    .price-label { color: #94a3b8; font-size: 0.9rem; }
    .capacite-row {
      display: flex; align-items: center; gap: 4px; color: #64748b; font-size: 0.85rem;
      margin: 8px 0 20px;
    }
    .capacite-row mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--primary); }

    .booking-form { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
    .booking-form label { font-size: 0.8rem; color: #64748b; margin-top: 10px; }
    .booking-form input {
      border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;
      font-family: inherit; font-size: 0.9rem; outline: none;
    }
    .booking-form input:focus { border-color: var(--primary); }
    .book-btn {
      margin-top: 16px; height: 48px; border: none; border-radius: 10px;
      background: var(--gradient); color: #fff; font-weight: 700; font-size: 0.95rem;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .book-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .guarantees { list-style: none; padding: 0; margin: 16px 0 0; display: flex; flex-direction: column; gap: 8px; }
    .guarantees li { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #475569; }
    .guarantees mat-icon { font-size: 16px; width: 16px; height: 16px; color: #10b981; }

    @media (max-width: 900px) {
      .event-layout { grid-template-columns: 1fr; }
      .booking-card { position: static; }
    }
  `]
})
export class EventDetailComponent implements OnInit {
  salle = signal<SalleResponse | null>(null);
  loading = signal(true);
  form: FormGroup;
  formInvalid$;
  fallbackImg = 'https://images.unsplash.com/photo-1780542900375-0cf459e38fbb?w=900';

  avisList = signal<AvisResponse[]>([]);
  replyingId = signal<number | null>(null);
  replyText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salleService: SalleService,
    private avisService: AvisService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      dateDebut: [null, Validators.required],
      nbJours: [1, [Validators.required, Validators.min(1)]],
    });

    this.formInvalid$ = this.form.statusChanges.pipe(
      map((status: string) => status === 'INVALID'),
      startWith(this.form.invalid)
    );
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.salleService.getById(id).subscribe({
      next: data => { this.salle.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });

    this.avisService.getBySalle(id).subscribe({
      next: (list) => this.avisList.set(list),
      error: () => {},
    });
  }

  isProprio(): boolean {
    return this.authService.currentUser()?.role === 'ROLE_PROPRIO';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  onRepondre(a: AvisResponse) {
    if (!this.replyText.trim()) return;

    this.avisService.repondre(a.id, this.replyText.trim()).subscribe({
      next: (updated) => {
        this.avisList.set(this.avisList().map(item => item.id === updated.id ? updated : item));
        this.replyingId.set(null);
        this.replyText = '';
        this.snackBar.open('Réponse publiée', 'OK', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open("Erreur lors de l'envoi de la réponse", 'Fermer', { duration: 4000 });
      },
    });
  }

  onBook() {
    const s = this.salle();
    if (!s || this.form.invalid) return;

    const { dateDebut, nbJours } = this.form.value;
    const date = new Date(dateDebut);
    const dateStr = date.toISOString().slice(0, 10);

    this.router.navigate(['/reserver', s.id], {
      queryParams: { date: dateStr, nbJours },
    });
  }
}
