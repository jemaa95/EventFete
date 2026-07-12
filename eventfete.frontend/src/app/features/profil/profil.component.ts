import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService, UserProfile } from '../../core/services/user.service';
import { ReservationService } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <h1>Mon profil</h1>
      <p class="subtitle">Gérez vos informations personnelles</p>

      <div *ngIf="loading()" class="spinner-wrap">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading() && profile() as p" class="profil-layout">
        <div class="side-col">
          <div class="card avatar-card">
            <div class="avatar"><mat-icon>person</mat-icon></div>
            <h2>{{ p.prenom }} {{ p.nom }}</h2>
            <p class="role-label">Fête de l'événement</p>
            <span class="member-since">Membre depuis {{ memberSince(p.createdAt) }}</span>
          </div>

          <div class="card stats-card" *ngIf="p.role === 'ROLE_CLIENT'">
            <h3>Statistiques</h3>
            <div class="stat-row">
              <span>Réservations totales</span>
              <strong>{{ stats().total }}</strong>
            </div>
            <div class="stat-row">
              <span>À venir</span>
              <strong class="accent">{{ stats().aVenir }}</strong>
            </div>
            <div class="stat-row">
              <span>Terminées</span>
              <strong class="success">{{ stats().terminees }}</strong>
            </div>
          </div>
        </div>

        <div class="main-col">
          <div class="card">
            <div class="card-header">
              <h3>Informations</h3>
              <button type="button" class="edit-btn" (click)="toggleEdit()">
                <mat-icon>edit</mat-icon> {{ editing() ? 'Annuler' : 'Modifier' }}
              </button>
            </div>

            <form [formGroup]="infoForm" (ngSubmit)="onSaveProfile()" class="info-form">
              <div class="field-row">
                <div class="field">
                  <label><mat-icon inline>person</mat-icon> Prénom</label>
                  <input formControlName="prenom" [readonly]="!editing()">
                </div>
                <div class="field">
                  <label><mat-icon inline>person</mat-icon> Nom</label>
                  <input formControlName="nom" [readonly]="!editing()">
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label><mat-icon inline>mail</mat-icon> Email</label>
                  <input [value]="p.email" readonly class="disabled-field">
                </div>
                <div class="field">
                  <label><mat-icon inline>phone</mat-icon> Téléphone</label>
                  <input formControlName="telephone" [readonly]="!editing()">
                </div>
              </div>

              <button type="submit" class="save-btn" *ngIf="editing()" [disabled]="infoForm.invalid || saving()">
                <mat-spinner *ngIf="saving()" diameter="18"></mat-spinner>
                <span *ngIf="!saving()">Enregistrer</span>
              </button>
            </form>
          </div>

          <div class="card">
            <h3>Sécurité</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="password-form">
              <label>Mot de passe actuel</label>
              <input type="password" formControlName="currentPassword">

              <label>Nouveau mot de passe</label>
              <input type="password" formControlName="newPassword">

              <label>Confirmer le nouveau mot de passe</label>
              <input type="password" formControlName="confirmPassword">
              <p class="field-error" *ngIf="passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched">
                Les mots de passe ne correspondent pas
              </p>

              <button type="submit" class="save-btn" [disabled]="passwordForm.invalid || changingPassword()">
                <mat-spinner *ngIf="changingPassword()" diameter="18"></mat-spinner>
                <span *ngIf="!changingPassword()">Changer le mot de passe</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 24px 0 2px; }
    .subtitle { color: #64748b; margin: 0 0 24px; }
    .spinner-wrap { display: flex; justify-content: center; padding: 64px; }

    .profil-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 20px;
      padding-bottom: 48px;
    }
    .side-col { display: flex; flex-direction: column; gap: 20px; }
    .main-col { display: flex; flex-direction: column; gap: 20px; }

    .card {
      background: #fff;
      border: 1px solid #eef0f3;
      border-radius: 16px;
      padding: 24px;
    }
    .avatar-card { text-align: center; }
    .avatar {
      width: 72px; height: 72px; border-radius: 50%;
      background: var(--gradient);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
    }
    .avatar mat-icon { color: #fff; font-size: 36px; width: 36px; height: 36px; }
    .avatar-card h2 { margin: 0 0 2px; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .role-label { margin: 0 0 12px; color: #94a3b8; font-size: 0.85rem; }
    .member-since {
      display: inline-block; background: var(--nav-active-bg); color: var(--primary);
      font-size: 0.78rem; font-weight: 600; padding: 4px 12px; border-radius: 999px;
    }

    .stats-card h3 { margin: 0 0 12px; font-size: 0.95rem; font-weight: 700; color: #1e293b; }
    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.88rem; color: #64748b; }
    .stat-row strong { color: #1e293b; }
    .stat-row strong.accent { color: var(--accent); }
    .stat-row strong.success { color: #10b981; }

    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .card-header h3, .main-col > .card > h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #1e293b; }
    .edit-btn {
      background: var(--gradient); color: #fff; border: none; border-radius: 999px;
      padding: 6px 16px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; gap: 4px;
    }
    .edit-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .field-row { display: flex; gap: 16px; margin-bottom: 12px; }
    .field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .field label { font-size: 0.78rem; color: #64748b; display: flex; align-items: center; gap: 4px; }
    .field label mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--primary); }
    .field input {
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px;
      font-family: inherit; font-size: 0.9rem; outline: none;
    }
    .field input:read-only { background: #f8fafc; color: #64748b; }
    .field input.disabled-field { background: #f1f5f9; color: #94a3b8; }

    .password-form { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
    .password-form label { font-size: 0.78rem; color: #64748b; margin-top: 8px; }
    .password-form input {
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px;
      font-family: inherit; font-size: 0.9rem; outline: none;
    }
    .field-error { color: #dc2626; font-size: 0.78rem; margin: 4px 0 0; }

    .save-btn {
      margin-top: 16px; height: 42px; border: none; border-radius: 10px;
      background: var(--gradient); color: #fff; font-weight: 700; font-size: 0.9rem;
      padding: 0 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      align-self: flex-start;
    }
    .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    @media (max-width: 800px) {
      .profil-layout { grid-template-columns: 1fr; }
      .field-row { flex-direction: column; }
    }
  `]
})
export class ProfilComponent {
  loading = signal(true);
  saving = signal(false);
  changingPassword = signal(false);
  editing = signal(false);
  profile = signal<UserProfile | null>(null);
  stats = signal({ total: 0, aVenir: 0, terminees: 0 });

  infoForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.infoForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      telephone: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordsMatch });

    this.load();
  }

  private passwordsMatch(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  private load() {
    this.userService.getProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.infoForm.patchValue({ prenom: p.prenom, nom: p.nom, telephone: p.telephone });
        this.loading.set(false);

        if (p.role === 'ROLE_CLIENT') {
          this.loadStats();
        }
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erreur de chargement du profil', 'Fermer', { duration: 4000 });
      },
    });
  }

  private loadStats() {
    this.reservationService.getMesReservations().subscribe({
      next: (list) => {
        const now = new Date();
        const total = list.length;
        const aVenir = list.filter(r =>
          r['statut'] === 'CONFIRMEE' && new Date(r['dateDebut'] as string) > now
        ).length;
        const terminees = list.filter(r =>
          r['statut'] === 'CONFIRMEE' && new Date(r['dateFin'] as string) < now
        ).length;
        this.stats.set({ total, aVenir, terminees });
      },
      error: () => {},
    });
  }

  toggleEdit() {
    this.editing.set(!this.editing());
  }

  onSaveProfile() {
    if (this.infoForm.invalid) return;
    this.saving.set(true);

    this.userService.updateProfile(this.infoForm.value).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.saving.set(false);
        this.editing.set(false);
        this.snackBar.open('Profil mis à jour', 'OK', { duration: 3000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 4000 });
      },
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;
    this.changingPassword.set(true);

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset();
        this.snackBar.open('Mot de passe modifié avec succès', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.changingPassword.set(false);
        const message = err.error?.message || 'Erreur lors du changement de mot de passe';
        this.snackBar.open(message, 'Fermer', { duration: 4000 });
      },
    });
  }

  memberSince(createdAt: string): string {
    const date = new Date(createdAt);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }
}
