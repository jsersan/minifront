import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: []
})
export class SearchResultsComponent implements OnInit {
  // Array para almacenar los productos encontrados
  products: Product[] = [];
  
  // Variable para almacenar el término de búsqueda
  searchTerm: string = '';
  
  // Variable para controlar el estado de carga
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,       // Para acceder a los parámetros de consulta de la URL
    private productService: ProductService // Para buscar productos
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios en los parámetros de consulta (query parameters)
    this.route.queryParams.subscribe({
      next: (params) => {
        // Obtener el término de búsqueda de los parámetros
        this.searchTerm = params['term'] || '';
        
        // Si hay un término de búsqueda, buscar productos
        if (this.searchTerm) {
          this.searchProducts();
        } else {
          // Si no hay término, inicializar con array vacío
          this.products = [];
          this.loading = false;
        }
      }
    });
  }

  // Método para buscar productos que coincidan con el término de búsqueda
  searchProducts(): void {
    this.loading = true;
    
    // Llamar al servicio para buscar productos
    this.productService.searchProducts(this.searchTerm).subscribe({
      next: (products) => {
        // Almacenar los productos encontrados
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching products', error);
        this.loading = false;
      }
    });
  }

  // Método auxiliar para formatear precios como moneda
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
  }
}
