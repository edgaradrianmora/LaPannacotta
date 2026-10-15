import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'inicio', canActivate: [authGuard], loadComponent: () => import('./pages/inicio/inicio').then(m => m.Inicio) },
  { path: 'productos', canActivate: [authGuard], loadComponent: () => import('./pages/productos/productos').then(m => m.Productos) },
  { path: 'pedidos', canActivate: [authGuard], loadComponent: () => import('./pages/pedidos/pedidos').then(m => m.Pedidos) },
  { path: 'delivery', canActivate: [authGuard], loadComponent: () => import('./pages/delivery/delivery').then(m => m.DeliveryPage) },
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: '**', redirectTo: 'inicio' }
];
