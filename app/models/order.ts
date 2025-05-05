import { Product } from "./product";

// Interfaz para pedidos
export interface Order {
  id: number;
  usuario_id: number;
  fecha: string;
  estado: string;
  total: number;
  direccion_envio?: string;
  metodo_pago?: string;
  num_seguimiento?: string;
  lineas: OrderLine[];
}

export interface OrderLine {
  id?: number;
  idpedido: number;
  idprod: number;
  color: string;
  cantidad: number;
  nombre: string; // Nombre del producto (para mostrar)
}

export interface CartItem {
  id: number;
  producto: string;
  cantidad: number;
  color?: string;
  talla?: string;
  precio: number;
  nombre?: string;
  imagen: string;
}