import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { API_URL } from '../core/config';
import { Repartidor } from '../core/models';

@Injectable({ providedIn: 'root' })
export class RepartidorService {

  private http = inject(HttpClient);
  private base = `${API_URL}/delivery/repartidores`;

  Listar() {
    return this.http.get<Repartidor[]>(this.base);
  }

  ListarActivos() {
    return this.http.get<Repartidor[]>(`${this.base}/activos`);
  }

  Obtener(id: number) {
    return this.http.get<Repartidor>(`${this.base}/${id}`);
  }

  Registrar(repartidor: Repartidor) {
    return this.http.post<Repartidor>(this.base, repartidor);
  }

  Actualizar(id: number, repartidor: Repartidor) {
    return this.http.put<Repartidor>(
      `${this.base}/${id}`,
      repartidor
    );
  }

  Eliminar(id: number) {
    return this.http.delete(
      `${this.base}/${id}`,
      { responseType: 'text' }
    );
  }
}