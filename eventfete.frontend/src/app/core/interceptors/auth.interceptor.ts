import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Évite de déclencher plusieurs rafraîchissements de token en parallèle si
// plusieurs requêtes échouent en même temps avec un token expiré.
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      const isAuthEndpoint = req.url.includes('/api/auth/');
      const isAuthError = error instanceof HttpErrorResponse &&
        (error.status === 401 || error.status === 403);

      // Ne pas tenter de rafraîchir sur les endpoints d'auth eux-mêmes
      // (login/register/refresh), ni s'il n'y a pas de refresh token disponible.
      if (!isAuthError || isAuthEndpoint || !authService.getRefreshToken()) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshedToken$.next(null);

        return authService.refreshAccessToken().pipe(
          switchMap((res) => {
            isRefreshing = false;
            refreshedToken$.next(res.accessToken);
            return next(req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            }));
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // Une autre requête est déjà en train de rafraîchir le token :
      // on attend le nouveau token puis on rejoue la requête avec.
      return refreshedToken$.pipe(
        filter((newToken) => newToken !== null),
        take(1),
        switchMap((newToken) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))
        )
      );
    })
  );
};
