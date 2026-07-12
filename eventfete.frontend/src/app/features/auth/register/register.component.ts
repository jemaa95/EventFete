import { Component, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatCardModule, MatRadioModule,
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Créer un compte</mat-card-title>
          <mat-card-subtitle>Rejoignez EventFete en quelques secondes</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="prenom" autocomplete="given-name">
                <mat-error *ngIf="form.get('prenom')?.hasError('required')">
                  Le prénom est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="nom" autocomplete="family-name">
                <mat-error *ngIf="form.get('nom')?.hasError('required')">
                  Le nom est requis
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
              <mat-icon matSuffix>mail</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">
                Format d'email invalide
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput type="tel" formControlName="telephone" autocomplete="tel">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="new-password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">
                Le mot de passe est requis
              </mat-error>
              <mat-error *ngIf="form.get('password')?.hasError('minlength')">
                Minimum 8 caractères
              </mat-error>
            </mat-form-field>

            <div class="role-field">
              <label class="role-label">Je suis :</label>
              <mat-radio-group formControlName="role" class="role-group">
                <mat-radio-button value="ROLE_CLIENT">Client — je réserve des salles</mat-radio-button>
                <mat-radio-button value="ROLE_PROPRIO">Propriétaire — je publie des salles</mat-radio-button>
              </mat-radio-group>
            </div>

            <button
              mat-raised-button color="primary"
              class="submit-btn"
              type="submit"
              [disabled]="(formInvalid$ | async) || loading()"
            >
              <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
              <span *ngIf="!loading()">Créer mon compte</span>
            </button>

            <p class="login-link">
              Déjà un compte ? <a routerLink="/login">Se connecter</a>
            </p>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 24px;
    }
    .register-card {
      width: 100%;
      max-width: 480px;
      border-radius: 16px !important;
      padding: 8px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 16px;
    }
    .row {
      display: flex;
      gap: 12px;
    }
    .row mat-form-field { flex: 1; }
    mat-form-field {
      width: 100%;
    }
    .role-field {
      margin: 8px 0 16px;
    }
    .role-label {
      display: block;
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 8px;
    }
    .role-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
    }
    .login-link {
      text-align: center;
      margin-top: 16px;
      color: #64748b;
      font-size: 0.9rem;
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  hidePassword = true;
  formInvalid$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['ROLE_CLIENT', Validators.required],
    });

    this.formInvalid$ = this.form.statusChanges.pipe(
      map(status => status === 'INVALID'),
      startWith(this.form.invalid)
    );
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);

    this.authService.register(this.form.value).subscribe({
      next: () => {
        const role = this.authService.currentUser()?.role;
        this.router.navigate([role === 'ROLE_PROPRIO' ? '/dashboard' : '/']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.status === 409
          ? 'Un compte existe déjà avec cet email.'
          : "Erreur lors de la création du compte";
        this.snackBar.open(message, 'Fermer', { duration: 4000 });
      },
    });
  }
}
