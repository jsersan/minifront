import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// Importaciones correctas de RxJS
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'api/products'; // URL a la API de productos
  private categoryUrl = 'api/categories'; // Añadimos esta propiedad que faltaba
  
  // Subject para el popup de producto
  private selectedProductSubject = new BehaviorSubject<Product | null>(null);
  selectedProduct$ = this.selectedProductSubject.asObservable();

  // Mapeo de productos a imágenes
  readonly PRODUCT_IMAGE_MAP: {[key: string]: string} = {
    // Bananas
    'banana para el ombligo negra': 'assets/images/banana/negro_banana1.jpg',
    'banana para el ombligo dorada': 'assets/images/banana/dorado_banana1.jpg',
    'banana con rosa': 'assets/images/banana-flor/default.jpg',
    'banana simple': 'assets/images/banana-simple/default.jpg',
    
    // Labrets
    'labret triángulo': 'assets/images/labret-triangulos/default.jpg',
    'labret corazón': 'assets/images/labret-corazon/default.jpg',
    'labret simple': 'assets/images/labret/default.jpg',
    
    // Barbells
    'barbell flecha': 'assets/images/barbell-flecha/default.jpg',
    'barbell con alas': 'assets/images/barbell-alas/default.jpg',
    'barbell largo': 'assets/images/barbell-largo/default.jpg',
    
    // Circular Barbells
    'circular barbell con piedra': 'assets/images/circular-barbel-piedra/default.jpg',
    'circular barbell con bola cóni': 'assets/images/circular-barbel/default.jpg',
    
    // Anillos
    'segment ring': 'assets/images/anillo/default.jpg',
    'anillo con bisagra': 'assets/images/anillo/default.jpg',
    'anillo con corazón': 'assets/images/anillo-corazon/default.jpg',
    'aro para nostril': 'assets/images/aro-nostril/default.jpg',
    
    // Túneles y Plugs
    'túnel': 'assets/images/tuneles/default.jpg',
    'túnel de silicona': 'assets/images/tuneles/default.jpg',
    'túnel acrílico': 'assets/images/tuneles/default.jpg',
    'túnel mandala': 'assets/images/tuneles/default.jpg',
    'túnel de acero': 'assets/images/tuneles-metal/default.jpg',
    'plug': 'assets/images/plug/default.jpg',
    
    // Expanders
    'set de dilatadores': 'assets/images/set-dilatadores/default.jpg',
    'expander espiral': 'assets/images/expander/default.jpg',
    'set de expanders': 'assets/images/set-dilatadores/default.jpg',
    'set de expanders curvados': 'assets/images/set-dilatadores/default.jpg',
  };

  // Imagen por defecto
  defaultImage = 'assets/images/default.jpg';

  constructor(private http: HttpClient) { }

  // Método para obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Método para obtener un producto específico
  getProduct(id: number): Observable<Product> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Product>(url);
  }

  // Método para obtener productos por categoría
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    const url = `${this.apiUrl}?categoryId=${categoryId}`;
    return this.http.get<Product[]>(url);
  }

  // Método para obtener una categoría específica
  getCategory(id: number): Observable<Category> {
    const url = `${this.categoryUrl}/${id}`;
    return this.http.get<Category>(url);
  }

  // Método para seleccionar un producto para el popup
  selectProductForPopup(product: Product): void {
    this.selectedProductSubject.next(product);
  }

  // Método para cerrar el popup
  closeProductPopup(): void {
    this.selectedProductSubject.next(null);
  }

  // MÉTODOS ADICIONALES QUE FALTAN SEGÚN LOS ERRORES

  // Método para añadir un nuevo producto
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // Método para subir imágenes de productos
  uploadProductImages(productId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file, file.name);
    });
    return this.http.post<any>(`${this.apiUrl}/${productId}/images`, formData);
  }

  // Método para actualizar un producto existente
  updateProduct(productId: number, product: Product): Observable<Product> {
    const url = `${this.apiUrl}/${productId}`;
    return this.http.put<Product>(url, product);
  }

  // Método para eliminar un producto
  deleteProduct(productId: number): Observable<any> {
    const url = `${this.apiUrl}/${productId}`;
    return this.http.delete<any>(url);
  }

  // Método para obtener los colores disponibles de un producto
  getProductColors(productId: number): Observable<any[]> {
    const url = `${this.apiUrl}/${productId}/colors`;
    return this.http.get<any[]>(url);
  }

  // Método para limpiar el producto seleccionado (renombrado según el error)
  clearSelectedProduct(): void {
    this.selectedProductSubject.next(null);
  }

  // Método para buscar productos
  searchProducts(term: string): Observable<Product[]> {
    const url = `${this.apiUrl}/search?term=${term}`;
    return this.http.get<Product[]>(url);
  }

  // Método para obtener la imagen de un producto
  getProductImageSrc(product: Product): string {
    if (!product || !product.nombre) {
      return this.defaultImage;
    }
    
    const nombre = product.nombre.toLowerCase();
    
    // Verificar coincidencias específicas primero
    const specificImage = this.getSpecificProductImage(nombre);
    if (specificImage) {
      return specificImage;
    }

    // Buscar coincidencias exactas en el mapa de productos
    if (this.PRODUCT_IMAGE_MAP[nombre]) {
      return this.PRODUCT_IMAGE_MAP[nombre];
    }
    
    // Si no hay coincidencia exacta, buscar coincidencias parciales en el mapa
    for (const [key, path] of Object.entries(this.PRODUCT_IMAGE_MAP)) {
      if (nombre.includes(key.toLowerCase())) {
        return path;
      }
    }
    
    // Categorizar por tipo de producto (enfoque secundario)
    if (nombre.includes('banana')) {
      return 'assets/images/banana/default.jpg';
    } else if (nombre.includes('labret')) {
      return 'assets/images/labret/default.jpg';
    } else if (nombre.includes('barbell') && nombre.includes('circular')) {
      return 'assets/images/circular-barbel/default.jpg';
    } else if (nombre.includes('barbell')) {
      return 'assets/images/barbell-largo/default.jpg';
    } else if (nombre.includes('anillo') || nombre.includes('ring') || nombre.includes('aro')) {
      return 'assets/images/anillo/default.jpg';
    } else if (nombre.includes('túnel') || nombre.includes('tunel')) {
      return 'assets/images/tuneles/default.jpg';
    } else if (nombre.includes('plug')) {
      return 'assets/images/plug/default.jpg';
    } else if (nombre.includes('dilatador') || nombre.includes('expander')) {
      return 'assets/images/dilatador/default.jpg';
    }
    
    // Si no hay coincidencia, usar default
    return this.defaultImage;
  }
  
  // Método adicional para manejar casos específicos con color o variante
  private getSpecificProductImage(productName: string): string | null {
    // Manejo de colores y variantes específicas
    if (productName.includes('negro') && productName.includes('banana')) {
      return 'assets/images/banana/negro_banana1.jpg';
    } else if (productName.includes('dorado') && productName.includes('banana')) {
      return 'assets/images/banana/dorado_banana1.jpg';
    } else if (productName.includes('plateado') && productName.includes('barbell')) {
      return 'assets/images/barbell-largo/plateado_barbell1.jpg';
    } else if (productName.includes('negro') && productName.includes('labret')) {
      return 'assets/images/labret/negro_labret1.jpg';
    } else if (productName.includes('dorado') && productName.includes('anillo')) {
      return 'assets/images/anillo/dorado_anillo1.jpg';
    } else if (productName.includes('plateado') && productName.includes('circular')) {
      return 'assets/images/circular-barbel/plateado_circular1.jpg';
    } else if (productName.includes('negro') && productName.includes('túnel')) {
      return 'assets/images/tuneles/negro_tunel1.jpg';
    } else if (productName.includes('acero') && productName.includes('túnel')) {
      return 'assets/images/tuneles-metal/default.jpg';
    }
    
    // Si no hay una coincidencia específica, return null
    return null;
  }

  // Método para manejar errores de carga de imágenes
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImage;
    img.onerror = null; // Prevenir bucles infinitos
  }
}