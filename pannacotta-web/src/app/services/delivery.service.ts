import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { API_URL } from '../core/config';
import { Delivery } from '../core/models';

@Injectable({ providedIn: 'root' })
export class DeliveryService {

  private http = inject(HttpClient);
  private base = `${API_URL}/delivery`;

  Listar() {
    return this.http.get<Delivery[]>(this.base);
  }

  PorPedido(pedidoId: number) {
    return this.http.get<Delivery | null>(
      `${this.base}/pedido/${pedidoId}`
    );
  }

  Obtener(id: number) {
    return this.http.get<Delivery>(
      `${this.base}/${id}`
    );
  }

  Registrar(delivery: Delivery) {
    return this.http.post<Delivery>(
      this.base,
      delivery
    );
  }

  Actualizar(
    id: number,
    delivery: {
      repartidorId?: number;
      repartidor?: string;
      estado: string;
    }
  ) {
    return this.http.put<Delivery>(
      `${this.base}/${id}`,
      delivery
    );
  }

  Eliminar(id: number) {
    return this.http.delete(
      `${this.base}/${id}`,
      { responseType: 'text' }
    );
  }

  Aviso() {
    return this.http.get(
      `${this.base}/aviso`,
      { responseType: 'text' }
    );
  }
}