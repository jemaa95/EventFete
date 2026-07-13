import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent) },
  { path: 'chercheur', loadComponent: () => import('./features/public/chercheur/chercheur.component').then(m => m.ChercheurComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/events/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'create-event', loadComponent: () => import('./features/events/create-event/create-event.component').then(m => m.CreateEventComponent), canActivate: [authGuard] },
  { path: 'event/:id', loadComponent: () => import('./features/events/event-detail/event-detail.component').then(m => m.EventDetailComponent) },
  { path: 'reserver/:salleId', loadComponent: () => import('./features/reservation-wizard/reservation-wizard.component').then(m => m.ReservationWizardComponent), canActivate: [authGuard] },
  { path: 'reservations', loadComponent: () => import('./features/reservations/reservations-historique.component').then(m => m.ReservationsHistoriqueComponent), canActivate: [authGuard] },
  { path: 'profil', loadComponent: () => import('./features/profil/profil.component').then(m => m.ProfilComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./features/admin/kyc/admin-kyc.component').then(m => m.AdminKycComponent), canActivate: [authGuard] },
  { path: 'admin/salles', loadComponent: () => import('./features/admin/salles/admin-salles.component').then(m => m.AdminSallesComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
