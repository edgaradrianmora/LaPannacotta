export function mensajeError(error: any): string {

  if (!error) {
    return 'Ocurrió un error inesperado.';
  }

  let detalle = '';

  if (typeof error.error === 'string') {
    detalle = error.error;
  } else if (error.error?.message) {
    detalle = String(error.error.message);
  } else if (error.message) {
    detalle = String(error.message);
  } else {
    detalle = String(error);
  }

  const texto = detalle.toLowerCase();

  // DELIVERY: pedido duplicado
  if (
    texto.includes('uk_delivery_pedido') ||
    (
      texto.includes('duplicate key value violates unique constraint') &&
      texto.includes('pedido_id')
    )
  ) {
    const coincidencia =
      detalle.match(/pedido_id\)\s*=\s*\((\d+)\)/i);

    const pedidoId =
      coincidencia && coincidencia[1]
        ? coincidencia[1]
        : null;

    if (pedidoId) {
      return `El pedido #${pedidoId} ya tiene una entrega registrada. No se puede crear una entrega duplicada.`;
    }

    return 'Este pedido ya tiene una entrega registrada. No se puede crear una entrega duplicada.';
  }

  // Problemas de conexión
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica que los servicios estén disponibles.';
  }

  // Sesión no válida
  if (error.status === 401) {
    return 'Tu sesión no es válida o ha vencido. Inicia sesión nuevamente.';
  }

  // Sin permisos
  if (error.status === 403) {
    return 'No tienes permisos para realizar esta operación.';
  }

  // Recurso no encontrado
  if (error.status === 404) {
    if (
      detalle &&
      !texto.includes('http failure') &&
      !texto.includes('unknown error')
    ) {
      return detalle;
    }

    return 'No se encontró la información solicitada.';
  }

  // Errores de validación enviados por el backend
  if (error.status === 400) {
    if (
      detalle &&
      !texto.includes('could not execute statement') &&
      !texto.includes('constraint') &&
      !texto.includes('insert into') &&
      !texto.includes('update ')
    ) {
      return detalle;
    }

    return 'No fue posible completar la operación. Revisa los datos ingresados.';
  }

  // Error interno
  if (error.status >= 500) {
    return 'Ocurrió un problema interno en el servidor. Intenta nuevamente.';
  }

  // Evita mostrar SQL o errores técnicos
  if (
    texto.includes('could not execute statement') ||
    texto.includes('hibernate') ||
    texto.includes('constraint') ||
    texto.includes('insert into') ||
    texto.includes('sql [')
  ) {
    return 'No fue posible completar la operación.';
  }

  // Si el backend devuelve un mensaje entendible,
  // se muestra directamente.
  if (
    detalle &&
    !texto.includes('http failure response') &&
    !texto.includes('unknown error')
  ) {
    return detalle;
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}