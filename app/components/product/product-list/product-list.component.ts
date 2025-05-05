// product-list.component.ts corregido con tipos explícitos
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product } from '../../../models/product';
import { Category } from '../../../models/category';
import { filter } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    public productService: ProductService,
    private categoryService: CategoryService,
    private sanitizer: DomSanitizer
  ) {
    // Detectar cambios de ruta para recargar productos cuando cambia la URL
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const params = this.route.snapshot.params;
        if (params['id']) {
          this.categoryId = +params['id'];
          this.loadCategoryDetails();
          this.loadProductsByCategory();
        } else {
          this.categoryId = null;
          this.loadAllProducts();
        }
      });
  }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: params => {
        if (params['id']) {
          this.categoryId = +params['id'];
          this.loadCategoryDetails();
          this.loadProductsByCategory();
        } else {
          this.categoryId = null;
          this.currentCategory = null;
          this.loadAllProducts();
        }
      }
    });
  }

  // Método para cargar los detalles de la categoría actual
  loadCategoryDetails(): void {
    this.loading = true;
    if (this.categoryId) {
      this.categoryService.getCategory(this.categoryId).subscribe({
        next: (category: Category) => {
          this.currentCategory = category;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error al cargar detalles de categoría:', error);
          this.loading = false;
        }
      });
    }
  }

  // Método para cargar productos filtrados por categoría
  loadProductsByCategory(): void {
    this.loading = true;
    this.products = [];

    if (this.categoryId !== null && this.categoryId !== undefined) {
      this.productService.getProductsByCategory(this.categoryId).subscribe({
        next: (products: Product[]) => {
          if (Array.isArray(products) && products.length > 0) {
            this.products = products;
          } else {
            this.products = [];
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error(`Error al cargar productos para categoría ${this.categoryId}:`, error);
          this.products = [];
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  // Método para cargar todos los productos (sin filtro)
  loadAllProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar todos los productos:', error);
        this.products = [];
        this.loading = false;
      }
    });
  }

  // Método para formatear precio como moneda
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}