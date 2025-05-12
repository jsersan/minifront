import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-product-popup',
  templateUrl: './product-popup.component.html',
  styleUrls: []
})
export class ProductPopupComponent implements OnInit, OnDestroy {
  currentProduct: Product | null = null;
  isOpen: boolean = false;
  quantity: number = 1;
  selectedColor: string = '';
  availableColors: string[] = [];
  loading: boolean = false;
  private subscription: Subscription | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // Suscripción al observable de producto seleccionado
    this.subscription = this.productService.selectedProduct$.subscribe(product => {
      if (product) {
        this.currentProduct = product;
        this.isOpen = true;
        this.resetOptions();
        this.loadProductColors();
      } else {
        this.isOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Cargar colores disponibles para el producto
  loadProductColors(): void {
    if (!this.currentProduct) return;

    this.loading = true;
    
    // Llamar al servicio para obtener colores del producto
    this.productService.getProductColors(this.currentProduct.id).subscribe({
      next: (colors) => {
        this.loading = false;
        if (colors && colors.length > 0) {
          this.availableColors = colors;
          this.selectedColor = colors[0]; // Seleccionar el primer color por defecto
        } else {
          // Si no hay colores, usar un valor por defecto
          this.availableColors = ['Estándar'];
          this.selectedColor = 'Estándar';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading product colors:', err);
        // En caso de error, usar un color predeterminado
        this.availableColors = ['Estándar'];
        this.selectedColor = 'Estándar';
      }
    });
  }

  // Cerrar el popup
  closePopup(): void {
    this.isOpen = false;
    setTimeout(() => {
      this.productService.clearSelectedProduct();
    }, 300); // Dar tiempo para la animación de cierre
  }

  // Añadir al carrito
  addToCart(): void {
    if (this.currentProduct) {
      this.cartService.addToCart(
        this.currentProduct,
        this.quantity,
        this.selectedColor
      );
      this.closePopup();
      
      // Opcional: Mostrar una notificación de éxito
      alert(`Producto añadido al carrito: ${this.currentProduct.nombre} - Color: ${this.selectedColor}`);
    }
  }

  // Incrementar cantidad
  incrementQuantity(): void {
    this.quantity++;
  }

  // Decrementar cantidad (mínimo 1)
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Resetear opciones al abrir el popup
  private resetOptions(): void {
    this.quantity = 1;
    this.selectedColor = '';
    this.availableColors = [];
  }
}
