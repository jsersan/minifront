// src/app/models/category.ts
export interface Category {
  id: number;
  nombre: string;
  padre?: number;    // ID de la categoría padre (opcional)
  tipo?: string;     // Tipo de categoría (opcional, ej: 'dilataciones', 'piercings')
  descripcion?: string; // Descripción de la categoría (opcional)
  // Añade otros campos según necesites
}