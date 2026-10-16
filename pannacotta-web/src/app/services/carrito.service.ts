import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Producto } from '../core/models';

export interface LineaCarrito { producto: Producto; cantidad: number; }

// Carrito de compras del cliente. Se guarda en el navegador (por usuario) para no perderlo al recargar.
@Injectable({ providedIn: 'root' })
export class CarritoService {
  private auth = inject(AuthService);
  private lineas = signal<LineaCarrito[]>(this.leer());

  readonly items = computed(() => this.lineas());
  readonly cantidad = computed(() => this.lineas().reduce((a, l) => a + l.cantidad, 0));
  readonly total = computed(() => this.lineas().reduce((a, l) => a + l.producto.precio * l.cantidad, 0));

  agregar(p: Producto) {
    const l = [...this.lineas()];
    const i = l.findIndex((x) => x.producto.id === p.id);
    if (i >= 0) {
      if (l[i].cantidad < p.stock) l[i] = { ...l[i], producto: p, cantidad: l[i].cantidad + 1 };
    } else if (p.stock > 0) {
      l.push({ producto: p, cantidad: 1 });
    }
    this.fijar(l);
  }

  cambiar(id: number | undefined, delta: number) {
    const l = this.lineas()
      .map((x) => (x.producto.id === id
        ? { ...x, cantidad: Math.min(x.producto.stock, Math.max(0, x.cantidad + delta)) }
        : x))
      .filter((x) => x.cantidad > 0);
    this.fijar(l);
  }

  quitar(id: number | undefined) { this.fijar(this.lineas().filter((x) => x.producto.id !== id)); }
  vaciar() { this.fijar([]); }

  enCarrito(id: number | undefined) { return this.lineas().find((x) => x.producto.id === id)?.cantidad ?? 0; }

  private clave() { return 'pannacotta_carrito_' + (this.auth.usuario()?.username ?? ''); }

  private fijar(l: LineaCarrito[]) {
    this.lineas.set(l);
    try { localStorage.setItem(this.clave(), JSON.stringify(l)); } catch { /* sin storage */ }
  }

  private leer(): LineaCarrito[] {
    try {
      const txt = localStorage.getItem(this.clave());
      return txt ? (JSON.parse(txt) as LineaCarrito[]) : [];
    } catch { return []; }
  }

  // Al iniciar sesión con otro usuario se carga SU carrito.
  recargar() { this.lineas.set(this.leer()); }
}
