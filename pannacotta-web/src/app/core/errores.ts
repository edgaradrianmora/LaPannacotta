import { HttpErrorResponse } from '@angular/common/http';

// Convierte cualquier error HTTP en un texto legible.
// El backend responde { timestamp, status, error, mensaje }.
export function mensajeError(err: unknown): string {
  const e = err as HttpErrorResponse;
  if (e?.status === 0) return 'No hay conexión con el Gateway (¿está encendido en el puerto 8771?).';
  const cuerpo = e?.error;
  if (cuerpo && typeof cuerpo === 'object' && cuerpo.mensaje) return String(cuerpo.mensaje);
  if (typeof cuerpo === 'string' && cuerpo.trim()) return cuerpo;
  if (e?.status === 403) return 'Acceso denegado (sesión vencida o sin permiso).';
  return `Error ${e?.status ?? ''}: no se pudo completar la operación.`;
}
