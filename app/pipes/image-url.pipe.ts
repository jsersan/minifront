import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageUrl'
})
export class ImageUrlPipe implements PipeTransform {
  transform(imagen: string, carpetaimg?: string, categoriaId?: number): string {
    if (!imagen) {
      return 'assets/images/background/placeholder.jpg';
    }

    // Mapeo de categorías a nombres de carpetas (basado en tu estructura real)
    const categoryFolderMap: { [key: number]: string } = {
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
    
    // Determinar la carpeta a usar
    let folder = 'background'; // carpeta por defecto
    
    if (carpetaimg && carpetaimg.trim() !== '') {
      // Usar la carpeta especificada en el producto
      folder = carpetaimg;
    } else if (categoriaId && categoryFolderMap[categoriaId]) {
      // Usar la carpeta basada en la categoría
      folder = categoryFolderMap[categoriaId];
    }
    
    console.log(`Generando ruta de imagen: assets/images/${folder}/${imagen}`);
    return `assets/images/${folder}/${imagen}`;
  }
}