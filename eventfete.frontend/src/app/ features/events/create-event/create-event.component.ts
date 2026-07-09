import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventService } from '../../../core/services/event.service';

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  const selectedDate = control.value;
  if (!selectedDate) return null;
  return selectedDate < new Date() ? { pastDate: true } : null;
}

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatCardModule,
    MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <a mat-icon-button routerLink="/dashboard" color="primary">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <h1>Créer un événement</h1>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Titre de l'événement</mat-label>
                <input matInput formControlName="title" placeholder="Conférence Tech Maroc 2026">
                <mat-icon matSuffix>title</mat-icon>
                <mat-error *ngIf="form.get('title')?.hasError('required')">Titre requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="4"
                  placeholder="Décrivez votre événement..."></textarea>
                <mat-error *ngIf="form.get('description')?.hasError('required')">Description requise</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="form.get('date')?.hasError('required')">Date requise</mat-error>
                <mat-error *ngIf="form.get('date')?.hasError('pastDate')">La date doit être dans le futur</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Lieu</mat-label>
                <input matInput formControlName="location" placeholder="Casablanca, Maroc">
                <mat-icon matSuffix>location_on</mat-icon>
                <mat-error *ngIf="form.get('location')?.hasError('required')">Lieu requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Capacité (personnes)</mat-label>
                <input matInput type="number" formControlName="capacity" min="1">
                <mat-icon matSuffix>people</mat-icon>
                <mat-error *ngIf="form.get('capacity')?.hasError('required')">Capacité requise</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Prix (MAD)</mat-label>
                <input matInput type="number" formControlName="price" min="0">
                <mat-icon matSuffix>payments</mat-icon>
                <mat-error *ngIf="form.get('price')?.hasError('required')">Prix requis</mat-error>
              </mat-form-field>

              <div class="upload-zone full-width" (click)="fileInput.click()">
                <mat-icon>cloud_upload</mat-icon>
                <p>{{ selectedFile ? selectedFile.name : 'Cliquez pour uploader une image' }}</p>
                <input #fileInput type="file" accept="image/*" hidden (change)="onFileChange($event)">
              </div>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/dashboard" [disabled]="loading">Annuler</button>
              <button mat-raised-button color="primary" type="submit"
                [disabled]="form.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                <span *ngIf="!loading">
                  <mat-icon>save</mat-icon> Créer l'événement
                </span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    h1 { margin: 0; font-size: 1.75rem; font-weight: 700; }
    .form-card { border-radius: 16px !important; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }
    .full-width { grid-column: 1 / -1; }
    .upload-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;
      color: #64748b;
    }
    .upload-zone:hover { border-color: #2563EB; color: #2563EB; } /* Fix var(--primary) */
    .upload-zone mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CreateEventComponent {
  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: [null, [Validators.required, futureDateValidator]], // empêche date passée
    location: ['', Validators.required],
    capacity: [null, [Validators.required, Validators.min(1)]],
    price: [null, [Validators.required, Validators.min(0)]],
  });
  selectedFile: File | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const formData = new FormData(); // IMPORTANT POUR L'IMAGE
    formData.append('title', this.form.value.title!);
    formData.append('description', this.form.value.description!);
    formData.append('date', this.form.value.date!.toISOString()); // Spring veut du ISO
    formData.append('location', this.form.value.location!);
    formData.append('capacity', String(this.form.value.capacity!));
    formData.append('price', String(this.form.value.price!));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.eventService.create(formData).subscribe({
      next: () => {
        this.snackBar.open('Événement créé avec succès !', 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 4000 });
      },
    });
  }
}
