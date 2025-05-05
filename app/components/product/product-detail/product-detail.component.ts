import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Product } from '../../../models/product';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  // Eliminamos la referencia al archivo SCSS si no existe
  styleUrls: []
})
export class ProductDetailComponent implements OnInit {
  // Datos del producto
  product: Product | null = null;
  
  // Opciones de producto
  colors: any[] = [];
  sizes: string[] = [];
  
  // Selecciones actuales
  selectedColor: string = '';
  selectedSize: string = '';
  quantity: number = 1;
  
  // Estado de carga
  loading: boolean = true;
  
  // Variable para controlar la visibilidad del popup
  showPopup: boolean = false;
  
  // Imágenes
  currentImageIndex: number = 0;
  relatedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    public productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProductDetails(productId);
      this.loadProductColors(productId);
      this.loadRelatedProducts(productId);
    });
  }

  // Cargar detalles del producto
  loadProductDetails(productId: number): void {
    this.loading = true;
    this.productService.getProduct(productId).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading product details', error);
        this.loading = false;
      }
    });
  }

  // Cargar colores disponibles
  loadProductColors(productId: number): void {
    this.productService.getProductColors(productId).subscribe({
      next: (colors: any[]) => (this.colors = colors),
      error: (error: any) => console.error('Error loading product colors', error)
    });
  }

  // Cargar productos relacionados
  loadRelatedProducts(productId: number): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.relatedProducts = products
          .filter(p => p.id !== productId)
          .slice(0, 4);
      },
      error: (error: any) => console.error('Error loading related products', error)
    });
  }

  // Método para obtener la ruta de la imagen del producto
  getImagePath(product: Product | null, color?: any): string {
    if (!product) {
      return this.productService.defaultImage; // Usar imagen por defecto
    }
    return this.productService.getProductImageSrc(product);
  }

  // Método para cambiar el color del producto
  changeColor(colorCode: string): void {
    this.selectedColor = colorCode;
  }

  // Método para formatear el precio
  formatPrice(price: number | undefined): string {
    if (price === undefined) return '€0.00';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Cambiar imagen actual
  changeImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Cambiar tamaño seleccionado
  selectSize(size: string): void {
    this.selectedSize = size;
  }

  // Incrementar cantidad
  incrementQuantity(): void {
    this.quantity++;
  }

  // Decrementar cantidad
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Cerrar popup del producto
  closeProductPopup(): void {
    this.showPopup = false;
  }

  // Abrir popup del producto
  openProductPopup(): void {
    this.showPopup = true;
  }

  // Añadir al carrito
  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(
        this.product,
        this.quantity,
        this.selectedColor,
        this.selectedSize
      );
    }
  }
}