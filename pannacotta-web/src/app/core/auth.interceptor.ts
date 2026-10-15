import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Se ejecuta en CADA petición HTTP:
//  1) agrega "Authorization: Bearer <token>" salvo en /auth/*
//  2) si el backend responde 401 o 403 (Spring Security usa 403 sin token) cierra sesión
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esAuth = req.url.includes('/auth/');
  const token = auth.token;

  const peticion = token && !esAuth
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!esAuth && (err.status === 401 || err.status === 403)) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
