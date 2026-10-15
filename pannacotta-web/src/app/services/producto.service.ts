import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../core/config';
import { Producto } from '../core/models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private base = `${API_URL}/productos`;

  Listar() { return this.http.get<Producto[]>(this.base); }
  Obtener(id: number) { return this.http.get<Producto>(`${this.base}/${id}`); }
  Registrar(p: Producto) { return this.http.post<Producto>(this.base, p); }
  Actualizar(id: number, p: Producto) { return this.http.put<Producto>(`${this.base}/${id}`, p); }
  Eliminar(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
  DescontarStock(id: number, cantidad: number) {
    return this.http.put<Producto>(`${this.base}/${id}/descontar-stock`, null, { params: { cantidad } });
  }
  Aviso() { return this.http.get(`${this.base}/aviso`, { responseType: 'text' }); }
}
