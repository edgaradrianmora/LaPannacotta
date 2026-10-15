import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { LoginRequest, LoginResponse, RegistroRequest, Usuario } from './models';

const CLAVE = 'pannacotta_sesion';

// Guarda la sesión (token JWT) y expone si hay usuario logueado.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private sesion = signal<LoginResponse | null>(this.leer());

  readonly usuario = computed(() => this.sesion());
  readonly logueado = computed(() => this.sesion() !== null);

  get token(): string | null {
    return this.sesion()?.token ?? null;
  }

  // POST /auth/login
  login(datos: LoginRequest) {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, datos).pipe(
      tap((resp) => {
        this.sesion.set(resp);
        try { localStorage.setItem(CLAVE, JSON.stringify(resp)); } catch { /* sin storage */ }
      })
    );
  }

  // POST /auth/registrar
  registrar(datos: RegistroRequest) {
    return this.http.post<Usuario>(`${API_URL}/auth/registrar`, datos);
  }

  // GET /auth/aviso (ping público)
  aviso() {
    return this.http.get(`${API_URL}/auth/aviso`, { responseType: 'text' });
  }

  logout() {
    this.sesion.set(null);
    try { localStorage.removeItem(CLAVE); } catch { /* sin storage */ }
    this.router.navigate(['/login']);
  }

  private leer(): LoginResponse | null {
    try {
      const txt = localStorage.getItem(CLAVE);
      return txt ? (JSON.parse(txt) as LoginResponse) : null;
    } catch {
      return null;
    }
  }
}
