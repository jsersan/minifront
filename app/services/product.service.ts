import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
// Importaciones correctas de RxJS
import { Observable, of } from 'rxjs'
import { BehaviorSubject } from 'rxjs'
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { Product } from '../models/product'
import { Category } from '../models/category'
import { environment } from '../../environments/environment'
import { ProductImageHelper } from '../helpers/product-image-helper';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Corregido: Usando la ruta correcta
  private apiUrl = `${environment.apiUrl}/productos`
  private categoryUrl = `${environment.apiUrl}/categorias`

  // Subject para el popup de producto
  private selectedProductSubject = new BehaviorSubject<Product | null>(null)
  selectedProduct$ = this.selectedProductSubject.asObservable()

  // Mapeo de productos a imágenes
  readonly PRODUCT_IMAGE_MAP: { [key: string]: string } = {
    // Bananas
    'banana para el ombligo negra': 'assets/images/banana-simple/banana-negra.jpg',
    'banana para el ombligo dorada': 'assets/images/banana-simple/banana-simple1.jpg',
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
    'circular barbell con piedra':
      'assets/images/circular-barbel-piedra/default.jpg',
    'circular barbell con bola cóni':
      'assets/images/circular-barbel/default.jpg',

    // Anillos
    'segment ring': 'assets/images/anillo/default.jpg',
    'anillo con bisagra': 'assets/images/anillo/default.jpg',
    'anillo con corazón': 'assets/images/anillo-corazon/default.jpg',
    'aro para nostril': 'assets/images/aro-nostril/default.jpg',

    // Túneles y Plugs
    túnel: 'assets/images/tuneles/default.jpg',
    'túnel de silicona': 'assets/images/tunel/tunel1.jpg',
    'túnel mandala': 'assets/images/tuneles/tuneles-orfebre1.jpg',
    'túnel de acero': 'assets/images/tuneles-metal/tunel-metal2.jpg',
    plug: 'assets/images/plug/default.jpg',
     'plug de silicona': 'assets/images/plug-dobles/plug-doble3.jpg',

    // Expanders
    'set de dilatadores': 'assets/images/set-dilatadores/default.jpg',
    'expander espiral': 'assets/images/expander/default.jpg',
    'set de expanders': 'assets/images/set-dilatadores/default.jpg',
    'set de expanders curvados': 'assets/images/set-dilatadores/default.jpg'
  }

  // Imagen por defecto
  defaultImage = 'assets/images/default.jpg'

  constructor (private http: HttpClient) {}

  // Método para obtener todos los productos
  getProducts (): Observable<Product[]> {
    // Añadir log para depuración
    console.log('Solicitando productos desde:', this.apiUrl)
    return this.http.get<Product[]>(this.apiUrl)
  }

  // Método para obtener un producto específico
  getProduct (id: number): Observable<Product> {
    const url = `${this.apiUrl}/${id}`
    console.log('Solicitando producto con ID:', id, 'desde:', url)
    return this.http.get<Product>(url)
  }

  // Método para obtener productos por categoría
  getProductsByCategory (categoryId: number): Observable<Product[]> {
    // Corregido: Ruta adecuada para filtrar por categoría
    const url = `${this.apiUrl}/categoria/${categoryId}`
    console.log(
      'Solicitando productos por categoría:',
      categoryId,
      'desde:',
      url
    )
    return this.http.get<Product[]>(url)
  }

  // Método para obtener una categoría específica
  getCategory (id: number): Observable<Category> {
    const url = `${this.categoryUrl}/${id}`
    return this.http.get<Category>(url)
  }

  // Método para seleccionar un producto para el popup
  selectProductForPopup (product: Product): void {
    this.selectedProductSubject.next(product)
  }

  // Método para cerrar el popup
  closeProductPopup (): void {
    this.selectedProductSubject.next(null)
  }

  // Método para añadir un nuevo producto
  addProduct (product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product)
  }

  // Método para subir imágenes de productos
  uploadProductImages (productId: number, files: File[]): Observable<any> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append('images', file, file.name)
    })
    return this.http.post<any>(`${this.apiUrl}/${productId}/images`, formData)
  }

  // Método para actualizar un producto existente
  updateProduct (productId: number, product: Product): Observable<Product> {
    const url = `${this.apiUrl}/${productId}`
    return this.http.put<Product>(url, product)
  }

  // Método para eliminar un producto
  deleteProduct (productId: number): Observable<any> {
    const url = `${this.apiUrl}/${productId}`
    return this.http.delete<any>(url)
  }

  // Método para obtener los colores disponibles de un producto

  getProductColors(productId: number): Observable<any[]> {
    const url = `${this.apiUrl}/${productId}/color`;
    
    return this.http.get<any[]>(url).pipe(
      map(response => {
        // Transformamos la respuesta para obtener solamente los nombres de los colores
        if (response && response.length > 0) {
          // Verificar si son objetos con propiedad 'color' o 'nombre'
          if (typeof response[0] === 'object') {
            return response.map(item => {
              // Puede venir como 'color' (de lineapedido) o 'nombre' (de product_colors)
              return item.color || item.nombre || 'Desconocido';
            });
          }
        }
        return response || [];
      }),
      catchError(error => {
        console.warn(`No se pudieron cargar colores para el producto ${productId}:`, error);
        // Devolver array vacío en caso de error
        return of([]);
      })
    );
  }

  // Método para limpiar el producto seleccionado
  clearSelectedProduct (): void {
    this.selectedProductSubject.next(null)
  }

  // Método para buscar productos
  searchProducts (term: string): Observable<Product[]> {
    // Corregido: Ruta adecuada para búsqueda
    const url = `${this.apiUrl}/search?q=${term}`
    return this.http.get<Product[]>(url)
  }

  // Método mejorado para product.service.ts
  // Método corregido para product.service.ts
/*   getProductImageSrc (product: Product): string {
    if (!product || !product.nombre) {
      return 'assets/images/default.jpg' // Ruta al default.jpg en la raíz
    }

    const nombre = product.nombre.toLowerCase()

    // 1. Detectar el tipo de producto para determinar la carpeta
    let carpeta = ''

    if (nombre.includes('aro') && nombre.includes('nostril')) {
      carpeta = 'aro-nostril'
      // Ver si hay archivos específicos en esta carpeta
      if (nombre.includes('negro')) {
        return `assets/images/${carpeta}/negro_aro-nostril1.jpg`
      } else if (nombre.includes('dorado')) {
        return `assets/images/${carpeta}/dorado_aro-nostril1.jpg`
      } else if (nombre.includes('plateado')) {
        return `assets/images/${carpeta}/plateado_aro-nostril1.jpg`
      }
      // Si no hay color específico, usar el primer archivo
      return `assets/images/${carpeta}/aro-nostril1.jpg`
    } else if (
      nombre.includes('set de dilatadores') ||
      nombre.includes('set de expanders')
    ) {
      carpeta = 'set-dilatadores'
      // No hay archivos de color específicos, usar el primer archivo
      return `assets/images/${carpeta}/set-dilatadores1.jpg`
    } else if (nombre.includes('expander')) {
      carpeta = 'expander'
      return `assets/images/${carpeta}/expander1.jpg`
    } else if (nombre.includes('banana') && nombre.includes('rosa')) {
      carpeta = 'banana-flor'
      return `assets/images/${carpeta}/banana-flor1.jpg`
    } else if (nombre.includes('banana') && nombre.includes('simple')) {
      carpeta = 'banana-simple'
      return `assets/images/${carpeta}/banana-simple1.jpg`
    } else if (nombre.includes('banana')) {
      carpeta = 'banana'
      if (nombre.includes('negro')) {
        return `assets/images/${carpeta}/negro_banana1.jpg`
      } else if (nombre.includes('dorado')) {
        return `assets/images/${carpeta}/dorado_banana1.jpg`
      }
      return `assets/images/${carpeta}/banana1.jpg`
    } else if (
      nombre.includes('túnel mandala') ||
      nombre.includes('tunel mandala')
    ) {
      carpeta = 'tuneles'
      return `assets/images/${carpeta}/tuneles1.jpg`
    } else if (
      nombre.includes('túnel de acero') ||
      nombre.includes('tunel de acero')
    ) {
      carpeta = 'tuneles-metal'
      return `assets/images/${carpeta}/tuneles-metal1.jpg`
    } else if (nombre.includes('túnel') || nombre.includes('tunel')) {
      carpeta = 'tuneles'
      return `assets/images/${carpeta}/tuneles1.jpg`
    } else if (nombre.includes('barbell') && nombre.includes('flecha')) {
      carpeta = 'barbell-flecha'
      if (nombre.includes('negro')) {
        return `assets/images/${carpeta}/negro_barbell1.jpg`
      } else if (nombre.includes('dorado')) {
        return `assets/images/${carpeta}/dorado_barbell1.jpg`
      } else if (nombre.includes('plateado')) {
        return `assets/images/${carpeta}/plateado_barbell1.jpg`
      }
      return `assets/images/${carpeta}/barbell-flecha1.jpg`
    } else if (nombre.includes('barbell') && nombre.includes('alas')) {
      carpeta = 'barbell-alas'
      return `assets/images/${carpeta}/barbell-alas1.jpg`
    } else if (nombre.includes('barbell') && nombre.includes('largo')) {
      carpeta = 'barbell-largo'
      return `assets/images/${carpeta}/barbell-largo1.jpg`
    } else if (nombre.includes('circular barbell')) {
      carpeta = 'circular-barbel'
      return `assets/images/${carpeta}/circular-barbel1.jpg`
    } else if (nombre.includes('labret') && nombre.includes('triángulo')) {
      carpeta = 'labret-triangulos'
      return `assets/images/${carpeta}/labret-triangulos1.jpg`
    } else if (nombre.includes('labret') && nombre.includes('corazón')) {
      carpeta = 'labret-corazon'
      return `assets/images/${carpeta}/labret-corazon1.jpg`
    } else if (nombre.includes('labret')) {
      carpeta = 'labret'
      return `assets/images/${carpeta}/labret1.jpg`
    } else if (nombre.includes('anillo') && nombre.includes('corazón')) {
      carpeta = 'anillo-corazon'
      return `assets/images/${carpeta}/anillo-corazon1.jpg`
    } else if (nombre.includes('anillo')) {
      carpeta = 'anillo'
      return `assets/images/${carpeta}/anillo1.jpg`
    } else if (nombre.includes('plug')) {
      carpeta = 'plug'
      return `assets/images/${carpeta}/plug1.jpg`
    }

    // Si no coincide con ninguno, usar la imagen por defecto de la raíz
    console.warn(`Tipo de producto no reconocido: ${product.nombre}`)
    return 'assets/images/default.jpg'
  } */

getProductImageSrc(product: Product): string {
  return ProductImageHelper.getProductImageSrc(product);
}


  // Método para obtener productos destacados (para la página principal)
getFeaturedProducts(): Observable<Product[]> {
  // Puedes implementar un endpoint específico para productos destacados
  // o simplemente limitar a algunos productos aleatorios o los más recientes
  console.log('Solicitando productos destacados desde:', this.apiUrl);
  
  // Opción 1: Endpoint específico si existe
  // return this.http.get<Product[]>(`${this.apiUrl}/destacados`);
  
  // Opción 2: Usar los productos existentes y limitar a unos pocos
  return this.getProducts().pipe(
    map(products => {
      // Tomar los primeros 8 productos como destacados
      return products.slice(0, 8);
    })
  );
}

  // Método mejorado para manejar errores de carga de imágenes
  handleImageError (event: Event): void {
    const img = event.target as HTMLImageElement
    const originalSrc = img.src
    console.error(`Error al cargar imagen: ${originalSrc}`)

    // Usar directamente la imagen por defecto en la raíz
    img.src = 'assets/images/default.jpg'

    img.onerror = null // Prevenir bucles infinitos
  }
}
