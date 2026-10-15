import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../core/config';
import { Pedido, PedidoRequest } from '../core/models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private base = `${API_URL}/pedidos`;

  Listar() { return this.http.get<Pedido[]>(this.base); }
  Obtener(id: number) { return this.http.get<Pedido>(`${this.base}/${id}`); }
  Registrar(p: PedidoRequest) { return this.http.post<Pedido>(this.base, p); }
  Confirmar(id: number) { return this.http.put<Pedido>(`${this.base}/${id}/confirmar`, null); }
  Eliminar(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
  Aviso() { return this.http.get(`${this.base}/aviso`, { responseType: 'text' }); }
}
