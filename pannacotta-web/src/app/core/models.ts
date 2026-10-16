// Modelos = forma de los JSON que devuelve el backend (vía Gateway).

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  rol: string;
}

export interface RegistroRequest {
  username: string;
  password: string;
  nombre: string;
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: boolean | string;
}

export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  estado: string;
  imagenUrl?: string | null;
}

export interface DetallePedido {
  id?: number;
  productoId: number;
  nombreProducto?: string;
  productoNombre?: string;
  cantidad: number;
  precioUnitario?: number;
  precio?: number;
  subtotal?: number;
}

export interface Pedido {
  id: number;
  clienteNombre: string;
  clienteUsername?: string;
  clienteTelefono?: string;
  direccionEntrega: string;
  estado?: string;
  total?: number;
  fecha?: string;
  fechaPedido?: string;
  detalle?: DetallePedido[];
  detalles?: DetallePedido[];
  items?: DetallePedido[];
}

export interface PedidoRequest {
  clienteNombre: string;
  clienteTelefono: string;
  direccionEntrega: string;
  items: { productoId: number; cantidad: number }[];
}

export interface Delivery {
  id?: number;
  pedidoId: number;
  clienteNombre: string;
  direccion: string;
  repartidor?: string;
  fechaAsignacion?: string;
  fechaEntrega?: string;
  estado: string;
}
