import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <mat-icon class="logo-icon">celebration</mat-icon>
          <h1>EventFete</h1>
          <p>Connectez-vous à votre espace</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="jemaa.kourda@gmail.com">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="form.get('email')?.hasError('required')">Email requis</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Email invalide</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mot de passe</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Mot de passe requis</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Minimum 6 caractères</mat-error>
          </mat-form-field>

          <button
            mat-raised-button color="primary"
            type="submit"
            class="submit-btn"
            [disabled]="form.invalid || loading"
          >
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            <span *ngIf="!loading">Se connecter</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #eff6ff 0%, #fff7ed 100%);
      padding: 16px;
    }
    .login-card {
      background: #fff;
      border-radius: 20px;
      padding: 48px 40px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 60px rgba(37,99,235,0.12);
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--accent);
    }
    .login-header h1 {
      margin: 8px 0 4px;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--primary);
    }
    .login-header p { color: var(--text-muted); margin: 0; }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .submit-btn {
      height: 52px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px !important;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.loading = false;
        this.snackBar.open('Email ou mot de passe incorrect', 'Fermer', { duration: 4000 });
      },
    });
  }
}