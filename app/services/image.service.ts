import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  // Mapeo de IDs de categoría a nombres de carpeta
  private categoryFolderMap: { [key: number]: string } = {
    1: 'anillo',
    2: 'tuneles',
    3: 'tuneles',
    4: 'plug',
    5: 'expander',
    6: 'banana',
    7: 'labret',
    8: 'barbell',
    9: 'circular-barbel',
    10: 'anillo'
  };
  
  // Mapeo de nombres de carpeta a variantes (por si hay subcarpetas o nombres alternativos)
  private folderVariants: { [key: string]: string[] } = {
    'anillo': ['anillo', 'anillo-corazon', 'anillo-fino'],
    'tuneles': ['tuneles', 'tuneles-metal', 'tuneles-orfebre'],
    'plug': ['plug', 'plugs-dobles'],
    'barbell': ['barbell-alas', 'barbell-flecha', 'barbell-largo'],
    'circular-barbel': ['circular-barbel', 'circular-barbel-piedra'],
    'labret': ['labret', 'labret-corazon', 'labret-triangulos'],
    'banana': ['banana', 'banana-flor', 'banana-simple']
  };
  
  getImagePath(product: any, color?: any): string {
    if (!product || !product.imagen) {
      return 'assets/images/background/placeholder.jpg'; // Ajustado a tu estructura
    }
    
    // Si ya tenemos una ruta completa, la usamos
    if (product.imagePath) {
      return product.imagePath;
    }
    
    const imageFile = color?.imagen || product.imagen;
    const categoryId = product.categoria_id || product.categoria;
    
    // 1. Usar carpetaimg del producto si existe
    if (product.carpetaimg) {
      return `assets/images/${product.carpetaimg}/${imageFile}`;
    }
    
    // 2. Usar el mapeo de categorías para determinar la carpeta
    if (categoryId && this.categoryFolderMap[categoryId]) {
      const baseFolder = this.categoryFolderMap[categoryId];
      
      // Verificar si hay variantes para esta carpeta
      if (this.folderVariants[baseFolder]) {
        // Si hay variantes específicas para colores, buscar coincidencias
        if (color && color.color) {
          const colorLower = color.color.toLowerCase();
          
          // Buscar variantes que contengan el nombre del color
          for (const variant of this.folderVariants[baseFolder]) {
            if (variant.toLowerCase().includes(colorLower)) {
              return `assets/images/${variant}/${imageFile}`;
            }
          }
        }
        
        // Si no hay coincidencia específica, usar la primera variante
        return `assets/images/${this.folderVariants[baseFolder][0]}/${imageFile}`;
      }
      
      // Si no hay variantes, usar el nombre base de la carpeta
      return `assets/images/${baseFolder}/${imageFile}`;
    }
    
    // 3. Carpeta por defecto si todo falla
    return `assets/images/background/${imageFile}`;
  }
}