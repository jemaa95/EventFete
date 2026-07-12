import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { SalleService } from '../../../core/services/salle.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header><mat-card-title>Nouvelle Salle</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Nom de la salle</mat-label>
              <input matInput formControlName="nom">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
              <mat-hint>Minimum 100 caractères</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Ville</mat-label>
              <input matInput formControlName="ville">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Adresse</mat-label>
              <input matInput formControlName="adresse">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Capacité (personnes)</mat-label>
              <input matInput type="number" formControlName="capacite">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Prix par jour (MAD)</mat-label>
              <input matInput type="number" formControlName="prixJour">
            </mat-form-field>

            <div class="file-field">
              <label>Photos (3 à 5, JPEG/PNG, 5 Mo max chacune)</label>
              <input type="file" (change)="onFilesSelected($event)" accept="image/jpeg,image/png" multiple>
              <p class="hint" *ngIf="selectedFiles.length">
                {{ selectedFiles.length }} photo(s) sélectionnée(s)
              </p>
              <p class="error" *ngIf="photoError">{{ photoError }}</p>
            </div>

            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
              @if(loading){<mat-spinner diameter="20"></mat-spinner>} @else {Créer la salle}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 24px; max-width: 700px; margin: auto; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .file-field { display: flex; flex-direction: column; gap: 4px; }
    .hint { font-size: 0.8rem; color: #64748b; margin: 0; }
    .error { font-size: 0.8rem; color: #dc2626; margin: 0; }
  `]
})
export class CreateEventComponent {
  form!: FormGroup;
  loading = false;
  selectedFiles: File[] = [];
  photoError = '';

  constructor(
    private fb: FormBuilder,
    private salleService: SalleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(100)]],
      ville: ['', Validators.required],
      adresse: ['', Validators.required],
      capacite: [100, [Validators.required, Validators.min(1)]],
      prixJour: [0, [Validators.required, Validators.min(0)]],
    });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = input.files ? Array.from(input.files) : [];

    // RG-09 : minimum 3, maximum 5 photos
    if (this.selectedFiles.length < 3) {
      this.photoError = 'Il faut au moins 3 photos.';
    } else if (this.selectedFiles.length > 5) {
      this.photoError = 'Maximum 5 photos autorisées.';
    } else {
      this.photoError = '';
    }
  }

  onSubmit() {
    if (this.form.invalid || this.photoError || this.selectedFiles.length < 3) return;

    this.loading = true;
    this.salleService.creer(this.form.value, this.selectedFiles).subscribe({
      next: () => {
        this.snackBar.open('Salle créée, en attente de validation', 'OK', { duration: 4000 });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors de la création de la salle', 'Fermer', { duration: 4000 });
      },
    });
  }
}
