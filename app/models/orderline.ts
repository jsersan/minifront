export interface OrderLine {
    id?: number;
    idpedido: number;
    idprod: number;
    color: string;
    cantidad: number;
    nombre?: string;
    precio?: number; // Añadir esta propiedad
  }