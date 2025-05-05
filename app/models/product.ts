// src/app/models/product.ts
export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  carpetaimg: string;  // Carpeta donde se almacenan las imágenes
  categoria_id?: number;
  stock?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  // Añade aquí otros campos que necesites
}