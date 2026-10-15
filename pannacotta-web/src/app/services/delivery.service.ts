import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../core/config';
import { Delivery } from '../core/models';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private http = inject(HttpClient);
  private base = `${API_URL}/delivery`;

  Listar() { return this.http.get<Delivery[]>(this.base); }
  Obtener(id: number) { return this.http.get<Delivery>(`${this.base}/${id}`); }
  Registrar(d: Delivery) { return this.http.post<Delivery>(this.base, d); }
  Actualizar(id: number, d: Partial<Delivery>) { return this.http.put<Delivery>(`${this.base}/${id}`, d); }
  Eliminar(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
  Aviso() { return this.http.get(`${this.base}/aviso`, { responseType: 'text' }); }
}
