import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalleService, SalleResponse } from '../../core/services/salle.service';
import { ReservationService, ReservationResponse } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';

type Etape = 1 | 2 | 3;

@Component({
  selector: 'app-reservation-wizard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-container narrow">
      <div class="stepper">
        <div class="step" [class.done]="etape() > 1" [class.active]="etape() === 1">
          <span class="circle"><mat-icon *ngIf="etape() > 1">check</mat-icon><span *ngIf="etape() <= 1">1</span></span>
          Informations
        </div>
        <div class="step-line" [class.done]="etape() > 1"></div>
        <div class="step" [class.done]="etape() > 2" [class.active]="etape() === 2">
          <span class="circle"><mat-icon *ngIf="etape() > 2">check</mat-icon><span *ngIf="etape() <= 2">2</span></span>
          Paiement
        </div>
        <div class="step-line" [class.done]="etape() > 2"></div>
        <div class="step" [class.active]="etape() === 3">
          <span class="circle">3</span>
          Confirmation
        </div>
      </div>

      <div *ngIf="loadingSalle()" class="spinner-wrap">
        <mat-spinner></mat-spinner>
      </div>

      <ng-container *ngIf="!loadingSalle() && salle() as s">

        <!-- ÉTAPE 1 : INFORMATIONS -->
        <div *ngIf="etape() === 1" class="step-panel">
          <h1>Informations de réservation</h1>
          <p class="subtitle">Remplissez vos informations pour réserver cette salle</p>

          <form [formGroup]="infoForm" (ngSubmit)="goToPaiement()" class="card">
            <h3>Informations</h3>
            <div class="field-row">
              <div class="field">
                <label>Prénom *</label>
                <input formControlName="prenom">
              </div>
              <div class="field">
                <label>Nom *</label>
                <input formControlName="nom">
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>E-mail *</label>
                <input formControlName="email" type="email">
              </div>
              <div class="field">
                <label>Téléphone *</label>
                <input formControlName="telephone">
              </div>
            </div>
            <div class="field">
              <label>Entreprise / Organisation</label>
              <input formControlName="entreprise">
            </div>

            <h3 class="section-spacer">Détails de l'événement</h3>
            <div class="field-row">
              <div class="field">
                <label>Type d'événement *</label>
                <select formControlName="typeEvenement">
                  <option value="" disabled>Sélectionnez un type</option>
                  <option value="Mariage">Mariage</option>
                  <option value="Anniversaire">Anniversaire</option>
                  <option value="Fête d'entreprise">Fête d'entreprise</option>
                  <option value="Conférence">Conférence</option>
                  <option value="Séminaire">Séminaire</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div class="field">
                <label>Date de l'événement *</label>
                <input formControlName="dateEvenement" type="date">
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Durée (jours) *</label>
                <input formControlName="nbJours" type="number" min="1">
              </div>
              <div class="field">
                <label>Nombre d'invités *</label>
                <input formControlName="nombreInvites" type="number" min="1">
              </div>
            </div>
            <div class="field">
              <label>Informations complémentaires</label>
              <textarea formControlName="informationsComplementaires" rows="3"
                placeholder="Besoins particuliers, équipements supplémentaires, etc."></textarea>
            </div>

            <div class="actions">
              <a routerLink="/event/{{ s.id }}" class="btn-outline">Retour</a>
              <button type="submit" class="btn-primary" [disabled]="(infoFormInvalid$ | async)">
                Continuer <mat-icon inline>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </div>

        <!-- ÉTAPE 2 : PAIEMENT -->
        <div *ngIf="etape() === 2" class="step-panel">
          <h1 class="center">Paiement sécurisé</h1>
          <p class="subtitle center">Vos informations de paiement sont cryptées et sécurisées</p>

          <div class="paiement-layout">
            <form [formGroup]="paiementForm" (ngSubmit)="onConfirmerPaiement()" class="card">
              <h3>Méthode de paiement</h3>
              <div class="payment-tabs">
                <button type="button" class="payment-tab" [class.active]="paiementForm.value.methode === 'CARTE'"
                  (click)="paiementForm.patchValue({methode: 'CARTE'})">
                  <mat-icon>credit_card</mat-icon> Carte bancaire
                </button>
                <button type="button" class="payment-tab" [class.active]="paiementForm.value.methode === 'PAYPAL'"
                  (click)="paiementForm.patchValue({methode: 'PAYPAL'})">
                  <mat-icon>account_balance_wallet</mat-icon> PayPal
                </button>
              </div>

              <ng-container *ngIf="paiementForm.value.methode === 'CARTE'">
                <div class="field">
                  <label>Numéro de carte *</label>
                  <input formControlName="numeroCarte" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="field">
                  <label>Nom du titulaire *</label>
                  <input formControlName="nomTitulaire" placeholder="JEAN DUPONT">
                </div>
                <div class="field-row">
                  <div class="field">
                    <label>Date d'expiration *</label>
                    <input formControlName="expiration" placeholder="MM/AA" maxlength="5">
                  </div>
                  <div class="field">
                    <label>CVV *</label>
                    <input formControlName="cvv" placeholder="123" maxlength="4">
                  </div>
                </div>
              </ng-container>

              <p class="secure-note"><mat-icon inline>lock</mat-icon> Paiement sécurisé SSL · Vos données sont protégées</p>

              <div class="actions">
                <button type="button" class="btn-outline" (click)="etape.set(1)">Retour</button>
                <button type="submit" class="btn-primary" [disabled]="paiementInvalid() || confirming()">
                  <mat-spinner *ngIf="confirming()" diameter="18"></mat-spinner>
                  <span *ngIf="!confirming()">Confirmer le paiement <mat-icon inline>lock</mat-icon></span>
                </button>
              </div>
            </form>

            <div class="card recap-card">
              <h3>Récapitulatif</h3>
              <div class="recap-row">
                <span>{{ s.nom }}</span>
                <span>{{ s.prixJour | number }} MAD</span>
              </div>
              <div class="recap-row muted">
                <span>Durée : {{ infoForm.value.nbJours }} jour(s)</span>
                <span>×{{ infoForm.value.nbJours }}</span>
              </div>
              <div class="recap-row muted">
                <span>Frais de service</span>
                <span>{{ fraisService | number }} MAD</span>
              </div>
              <div class="recap-total">
                <span>Total</span>
                <span>{{ totalEstime() | number }} MAD</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ÉTAPE 3 : CONFIRMATION -->
        <div *ngIf="etape() === 3 && confirmation() as c" class="step-panel">
          <div class="card confirm-card">
            <div class="confirm-icon"><mat-icon>check_circle</mat-icon></div>
            <h1 class="center">Réservation confirmée !</h1>
            <p class="subtitle center">Votre réservation a été enregistrée avec succès</p>
            <span class="ref-badge">Numéro de réservation : #EF-{{ refYear }}-{{ refId }}</span>
          </div>

          <div class="card">
            <h3>Détails de votre réservation</h3>
            <div class="details-grid">
              <div class="detail-item">
                <mat-icon>location_on</mat-icon>
                <div>
                  <strong>Salle</strong>
                  <p>{{ s.nom }}<br>{{ s.adresse }}, {{ s.ville }}</p>
                </div>
              </div>
              <div class="detail-item">
                <mat-icon>event</mat-icon>
                <div>
                  <strong>Date</strong>
                  <p>{{ infoForm.value.dateEvenement }}<br>Durée : {{ infoForm.value.nbJours }} jour(s)</p>
                </div>
              </div>
              <div class="detail-item">
                <mat-icon>mail</mat-icon>
                <div>
                  <strong>Courriel de confirmation</strong>
                  <p>{{ infoForm.value.email }}<br><span class="sent">✓ Courriel envoyé</span></p>
                </div>
              </div>
              <div class="detail-item">
                <mat-icon>call</mat-icon>
                <div>
                  <strong>Contact</strong>
                  <p>{{ infoForm.value.telephone }}<br>Pour toute question</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card next-steps">
            <h3>Prochaines étapes</h3>
            <ul>
              <li><mat-icon inline>check_circle</mat-icon> Un email de confirmation vous a été envoyé avec tous les détails</li>
              <li><mat-icon inline>check_circle</mat-icon> Le propriétaire va vous contacter sous 24h pour finaliser les détails</li>
              <li><mat-icon inline>check_circle</mat-icon> Vous pouvez annuler gratuitement jusqu'à 48h avant l'événement</li>
            </ul>
          </div>

          <div class="actions final-actions">
            <a routerLink="/reservations" class="btn-outline">Voir mes réservations</a>
            <button type="button" class="btn-primary" (click)="downloadRecu()">
              <mat-icon inline>download</mat-icon> Télécharger le reçu
            </button>
            <a routerLink="/" class="btn-outline">Retour à l'accueil</a>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .narrow { max-width: 760px; }
    h1 { font-size: 1.4rem; font-weight: 800; color: #1e1b2e; margin: 0 0 4px; }
    .subtitle { color: #64748b; margin: 0 0 24px; }
    .center { text-align: center; }
    .spinner-wrap { display: flex; justify-content: center; padding: 64px; }

    .stepper {
      display: flex; align-items: center; justify-content: center;
      gap: 8px; padding: 24px 0;
    }
    .step {
      display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: #94a3b8;
    }
    .step.active, .step.done { color: var(--primary); }
    .circle {
      width: 28px; height: 28px; border-radius: 50%; background: #e2e8f0; color: #94a3b8;
      display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700;
    }
    .step.active .circle, .step.done .circle { background: var(--gradient); color: #fff; }
    .circle mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .step-line { width: 48px; height: 2px; background: #e2e8f0; }
    .step-line.done { background: var(--primary); }

    .card {
      background: #fff; border: 1px solid #eef0f3; border-radius: 16px; padding: 24px; margin-bottom: 20px;
    }
    .card h3 { margin: 0 0 16px; font-size: 1rem; font-weight: 700; color: #1e293b; }
    .section-spacer { margin-top: 24px; }

    .field-row { display: flex; gap: 16px; margin-bottom: 12px; }
    .field { flex: 1; display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .field label { font-size: 0.78rem; color: #64748b; }
    .field input, .field select, .field textarea {
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px;
      font-family: inherit; font-size: 0.9rem; outline: none; resize: vertical;
    }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--primary); }

    .actions { display: flex; justify-content: space-between; margin-top: 16px; gap: 12px; }
    .btn-outline {
      background: #fff; border: 1px solid #e2e8f0; color: #475569; text-decoration: none;
      border-radius: 10px; padding: 10px 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .btn-primary {
      background: var(--gradient); border: none; color: #fff; text-decoration: none;
      border-radius: 10px; padding: 10px 20px; font-size: 0.9rem; font-weight: 700; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .payment-tabs { display: flex; gap: 12px; margin-bottom: 16px; }
    .payment-tab {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff; padding: 12px;
      font-weight: 600; font-size: 0.88rem; color: #64748b; cursor: pointer;
    }
    .payment-tab.active { border-color: var(--primary); color: var(--primary); background: var(--nav-active-bg); }
    .secure-note {
      display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #64748b; margin: 4px 0 0;
    }
    .secure-note mat-icon { color: #10b981; font-size: 16px; width: 16px; height: 16px; }

    .paiement-layout { display: grid; grid-template-columns: 1fr 260px; gap: 20px; align-items: start; }
    .recap-card { position: sticky; top: 88px; }
    .recap-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: #1e293b; padding: 6px 0; }
    .recap-row.muted { color: #64748b; font-size: 0.82rem; }
    .recap-total {
      display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px;
      border-top: 1px solid #eef0f3; font-weight: 800; font-size: 1.05rem; color: var(--primary);
    }

    .confirm-card { text-align: center; }
    .confirm-icon {
      width: 64px; height: 64px; border-radius: 50%; background: #dcfce7;
      display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
    }
    .confirm-icon mat-icon { color: #16a34a; font-size: 34px; width: 34px; height: 34px; }
    .ref-badge {
      display: inline-block; background: var(--nav-active-bg); color: var(--primary);
      font-weight: 700; font-size: 0.85rem; padding: 8px 18px; border-radius: 999px; margin-top: 8px;
    }

    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .detail-item { display: flex; gap: 10px; }
    .detail-item mat-icon { color: var(--primary); }
    .detail-item strong { font-size: 0.85rem; color: #1e293b; display: block; margin-bottom: 2px; }
    .detail-item p { margin: 0; font-size: 0.85rem; color: #64748b; line-height: 1.5; }
    .sent { color: #16a34a; font-weight: 600; }

    .next-steps ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .next-steps li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.85rem; color: #475569; }
    .next-steps mat-icon { color: #10b981; font-size: 18px; width: 18px; height: 18px; }

    .final-actions { justify-content: center; flex-wrap: wrap; }

    @media (max-width: 700px) {
      .field-row { flex-direction: column; gap: 0; }
      .paiement-layout { grid-template-columns: 1fr; }
      .details-grid { grid-template-columns: 1fr; }
      .actions { flex-direction: column-reverse; }
    }
  `]
})
export class ReservationWizardComponent implements OnInit {
  etape = signal<Etape>(1);
  loadingSalle = signal(true);
  confirming = signal(false);
  salle = signal<SalleResponse | null>(null);
  confirmation = signal<ReservationResponse | null>(null);
  fraisService = 500;

  infoForm: FormGroup;
  paiementForm: FormGroup;
  infoFormInvalid$;

  refId = '';
  refYear = new Date().getFullYear();

  totalEstime = computed(() => {
    const s = this.salle();
    const nbJours = Number(this.infoForm?.value?.nbJours ?? 1);
    if (!s) return this.fraisService;
    return Number(s.prixJour) * nbJours + this.fraisService;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private salleService: SalleService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    const user = this.authService.currentUser();

    this.infoForm = this.fb.group({
      prenom: [user?.prenom || '', Validators.required],
      nom: [user?.nom || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      entreprise: [''],
      typeEvenement: ['', Validators.required],
      dateEvenement: ['', Validators.required],
      nbJours: [1, [Validators.required, Validators.min(1)]],
      nombreInvites: [null, [Validators.required, Validators.min(1)]],
      informationsComplementaires: [''],
    });

    this.paiementForm = this.fb.group({
      methode: ['CARTE'],
      numeroCarte: [''],
      nomTitulaire: [''],
      expiration: [''],
      cvv: [''],
    });

    this.infoFormInvalid$ = this.infoForm.statusChanges.pipe(
      map((status: string) => status === 'INVALID'),
      startWith(this.infoForm.invalid)
    );

    // Pré-remplissage optionnel depuis la recherche (date/nbJours passés en query params)
    const params = this.route.snapshot.queryParamMap;
    if (params.get('date')) this.infoForm.patchValue({ dateEvenement: params.get('date') });
    if (params.get('nbJours')) this.infoForm.patchValue({ nbJours: Number(params.get('nbJours')) });
  }

  ngOnInit() {
    const salleId = Number(this.route.snapshot.paramMap.get('salleId'));
    this.salleService.getById(salleId).subscribe({
      next: (data) => { this.salle.set(data); this.loadingSalle.set(false); },
      error: () => { this.loadingSalle.set(false); },
    });
  }

  goToPaiement() {
    if (this.infoForm.invalid) return;
    this.etape.set(2);
  }

  paiementInvalid(): boolean {
    if (this.paiementForm.value.methode !== 'CARTE') return false;
    const { numeroCarte, nomTitulaire, expiration, cvv } = this.paiementForm.value;
    return !numeroCarte || !nomTitulaire || !expiration || !cvv;
  }

  onConfirmerPaiement() {
    const s = this.salle();
    if (!s || this.paiementInvalid()) return;
    this.confirming.set(true);

    const { dateEvenement, nbJours, typeEvenement, nombreInvites, entreprise, informationsComplementaires } = this.infoForm.value;
    const debut = new Date(dateEvenement);
    const fin = new Date(debut);
    fin.setDate(fin.getDate() + Number(nbJours));

    this.reservationService.creer({
      salleId: s.id,
      dateDebut: debut.toISOString(),
      dateFin: fin.toISOString(),
      modePaiement: this.paiementForm.value.methode,
      typeEvenement,
      nombreInvites: Number(nombreInvites),
      entreprise: entreprise || undefined,
      informationsComplementaires: informationsComplementaires || undefined,
    }).subscribe({
      next: (res) => {
        this.confirming.set(false);
        this.confirmation.set(res);
        this.refId = String(res['id'] ?? '0000').padStart(4, '0');
        this.refYear = new Date(dateEvenement).getFullYear();
        this.etape.set(3);
      },
      error: (err) => {
        this.confirming.set(false);
        const message = err.status === 409
          ? "Ce créneau vient d'être réservé par quelqu'un d'autre."
          : 'Erreur lors de la réservation';
        this.snackBar.open(message, 'Fermer', { duration: 4000 });
      },
    });
  }

  downloadRecu() {
    this.snackBar.open('Génération du reçu à venir', 'OK', { duration: 3000 });
  }
}
