import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/events/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'events/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/events/create-event/create-event.component').then(m => m.CreateEventComponent),
  },
  {
    path: 'events/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/events/event-detail/event-detail.component').then(m => m.EventDetailComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
