import { Routes } from '@angular/router';
import { adminGuard, clienteGuard, inicioGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },

  // Panel del administrador
  { path: 'inicio', canActivate: [adminGuard], loadComponent: () => import('./pages/inicio/inicio').then(m => m.Inicio) },
  { path: 'productos', canActivate: [adminGuard], loadComponent: () => import('./pages/productos/productos').then(m => m.Productos) },
  { path: 'pedidos', canActivate: [adminGuard], loadComponent: () => import('./pages/pedidos/pedidos').then(m => m.Pedidos) },
  { path: 'delivery', canActivate: [adminGuard], loadComponent: () => import('./pages/delivery/delivery').then(m => m.DeliveryPage) },

  // Tienda del cliente
  { path: 'tienda', canActivate: [clienteGuard], loadComponent: () => import('./pages/tienda/tienda').then(m => m.Tienda) },
  { path: 'mis-pedidos', canActivate: [clienteGuard], loadComponent: () => import('./pages/mis-pedidos/mis-pedidos').then(m => m.MisPedidos) },

  { path: '', pathMatch: 'full', canActivate: [inicioGuard], children: [] },
  { path: '**', canActivate: [inicioGuard], children: [] }
];
