// src/app/components/product/product-popup/product-popup.component.ts
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
  showPopup: boolean = false;
  quantity: number = 1;
  selectedColor: string = '';
  availableColors: string[] = [];
  private subscription: Subscription | null = null;
isOpen: any;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // Suscribirse a cambios en el producto seleccionado
    this.subscription = this.productService.selectedProduct$.subscribe(product => {
      if (product) {
        this.currentProduct = product;
        this.showPopup = true;
        this.resetOptions();
        this.loadProductColors();
      } else {
        this.showPopup = false;
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

    // Aquí podrías cargar los colores desde la API
    // Por ahora, usamos colores simulados
    this.availableColors = ['Negro', 'Blanco', 'Azul', 'Rojo'];
    this.selectedColor = this.availableColors[0];
  }

  // Cerrar el popup
  closePopup(): void {
    this.showPopup = false;
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
  }

  // Método para formatear el precio (usado en la plantilla)
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
  }
}