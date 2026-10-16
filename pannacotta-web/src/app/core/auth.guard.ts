import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Protege las pantallas: sin sesión te manda a /login.
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.logueado() ? true : router.createUrlTree(['/login']);
};

// Solo el administrador (panel de la pastelería). Un cliente vuelve a la tienda.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.logueado()) return router.createUrlTree(['/login']);
  return auth.esAdmin() ? true : router.createUrlTree(['/tienda']);
};

// Solo el cliente (tienda y mis pedidos). Un administrador vuelve a su panel.
export const clienteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.logueado()) return router.createUrlTree(['/login']);
  return auth.esCliente() ? true : router.createUrlTree(['/inicio']);
};

// Ruta vacía u desconocida: manda a cada rol a su pantalla.
export const inicioGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return router.createUrlTree([auth.logueado() ? auth.rutaInicio() : '/login']);
};
