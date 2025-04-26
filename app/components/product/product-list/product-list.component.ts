import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product } from '../../../models/product';
import { Category } from '../../../models/category';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: []
})
export class ProductListComponent implements OnInit {
  // Array para almacenar los productos a mostrar
  products: Product[] = [];
  
  // Propiedad para almacenar la categoría actual
  currentCategory: Category | null = null;
  
  // Propiedad para almacenar el ID de categoría (de la URL)
  categoryId: number | null = null;

  // Variable para mostrar estado de carga
  loading: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    // Detectar cambios de ruta para recargar productos cuando cambia la URL
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Reiniciar productos y categoría cuando cambia la URL
      this.products = [];
      this.currentCategory = null;
      // Obtener el ID de categoría de la URL actual
      const id = this.route.snapshot.params['id'];
      if (id) {
        this.categoryId = +id;
        this.loadCategoryDetails();
        this.loadProductsByCategory();
      }
    });
  }

  ngOnInit(): void {
    // Suscribirse a los cambios en los parámetros de la ruta
    this.route.params.subscribe({
      next: (params) => {
        // Si hay un parámetro 'id', es una categoría específica
        if (params['id']) {
          this.categoryId = +params['id']; // Convertir a número
          this.loadCategoryDetails();
          this.loadProductsByCategory();
        } else {
          // Sin parámetro 'id', mostrar todos los productos
          this.categoryId = null;
          this.currentCategory = null;
          this.loadAllProducts();
        }
      }
    });
  }
  
  // Método para abrir el popup del producto
  openProductPopup(product: Product): void {
    this.productService.selectProductForPopup(product);
  }

  // Método para cargar los detalles de la categoría actual
  loadCategoryDetails(): void {
    this.loading = true;
    if (this.categoryId) {
      this.categoryService.getCategory(this.categoryId).subscribe({
        next: (category) => {
          console.log('Categoría cargada:', category);
          this.currentCategory = category;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar detalles de categoría:', error);
          this.loading = false;
        }
      });
    }
  }

  // Método para cargar productos filtrados por categoría
  loadProductsByCategory(): void {
    this.loading = true;
    if (this.categoryId) {
      console.log(`Cargando productos para categoría ID: ${this.categoryId}`);
      this.productService.getProductsByCategory(this.categoryId).subscribe({
        next: (products) => {
          console.log(`Productos cargados para categoría ${this.categoryId}:`, products);
          this.products = products;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar productos por categoría:', error);
          this.products = []; // Inicializar array vacío en caso de error
          this.loading = false;
        }
      });
    }
  }

  // Método para cargar todos los productos (sin filtro)
  loadAllProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('Todos los productos cargados:', products.length);
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar todos los productos:', error);
        this.products = []; // Inicializar array vacío en caso de error
        this.loading = false;
      }
    });
  }

  // Método para formatear precio como moneda
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
  }
}