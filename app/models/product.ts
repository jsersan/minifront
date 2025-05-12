// src/app/models/product.ts
export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  carpetaimg: string;  // Carpeta donde se almacenan las imágenes
  
  // Campos para compatibilidad con el backend
  categoria?: number;   // Campo original del backend
  categoria_id?: number; // Alias usado en algunos lugares
  category_id?: number;  // Alias usado en otros lugares
  
  // Relación con categoría
  category?: any;
  
  // Metadatos opcionales
  stock?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}