import { Component, OnInit, HostListener, NgZone, OnDestroy, AfterViewInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { LoginPopupService } from '../../services/login-popup.service';
import { OrderLine } from 'src/app/models/order';
import { CartItem } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy, AfterViewInit {
  // Array para almacenar los items del carrito
  cartItems: CartItem[] = [];
  
  // Array para las líneas de pedido
  orderLines: OrderLine[] = [];
  
  // Variable para almacenar el total del carrito
  total: number = 0;
  
  // Variable para controlar si estamos en proceso de eliminar
  private isRemoving: boolean = false;
  
  // Suscripciones para limpiar en la destrucción
  private cartSubscription: Subscription | null = null;
  private cartVisibilitySubscription: Subscription | null = null;
  
  // Constructor con inyección de dependencias
  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private zone: NgZone,
    public productService: ProductService,
    private renderer: Renderer2,
    private loginPopupService: LoginPopupService
  ) { }
  
  ngOnInit(): void {
    console.log('CartComponent: iniciando...');
    
    // Añadir globalmente un script para interceptar las modificaciones del DOM
    this.addDOMObserver();
    
    // Suscripción al observable de items del carrito
    this.cartSubscription = this.cartService.cartItems.subscribe({
      next: (items) => {
        console.log('CartComponent: items del carrito actualizados', items.length);
        // Mapear los items
        this.cartItems = items.map(item => {
          return {
            id: item.id,
            nombre: item.nombre || (item.producto ? item.producto.nombre : ''),
            imagen: item.imagen || (item.producto ? `assets/images/${item.producto.carpetaimg}/${item.producto.imagen}` : ''),
            color: item.color || '',
            cantidad: item.cantidad,
            precio: item.precio,
            producto: item.producto
          };
        });
        
        // Convertir CartItems a OrderLines para usar con OrderLineComponent
        this.convertCartItemsToOrderLines();
        
        // Calcular el total del carrito
        this.total = Math.round(this.cartService.getCartTotal() * 100) / 100;
        
        // IMPORTANTE: Solo cerrar el carrito si está vacío y NO estamos en proceso de eliminar
        if (items.length === 0 && this.cartService.isCartOpen && !this.isRemoving) {
          console.log('CartComponent: Carrito vacío, programando cierre en 500ms');
          setTimeout(() => {
            this.closeCart();
          }, 500);
        }
        
        // Resetear isRemoving SOLO si el carrito está completamente vacío
        if (items.length === 0) {
          console.log('CartComponent: Carrito vacío, reseteando isRemoving');
          this.isRemoving = false;
        }
        
        // Fijar los precios después de cada actualización
        setTimeout(() => {
          this.fixPriceFormat();
        }, 100);
      }
    });
    
    // Añadir listener explícito para cambios en la visibilidad del carrito
    this.listenToCartVisibilityChanges();
    
    // Sobrescribir el método closeCart del servicio para evitar cierres no deseados
    this.patchCartServiceCloseMethod();
    
    // Aumentar el tamaño de los elementos del carrito en 5px
    this.enhanceCartSize();
  }
  
  // Método para interceptar cambios en el DOM y corregir los precios
  private addDOMObserver(): void {
    const script = this.renderer.createElement('script');
    
    // Script para interceptar y corregir cambios en el DOM
    script.text = `
      (function() {
        // Función para corregir formato de precios
        function fixPriceFormat() {
          // 1. Corregir el total principal
          const totalElement = document.querySelector('[data-label="Total:"] + span');
          if (totalElement) {
            const rawTotal = parseFloat(totalElement.textContent.replace('€', '').trim());
            if (!isNaN(rawTotal)) {
              totalElement.textContent = rawTotal.toFixed(2) + '€';
            }
          }
          
          // 2. Corregir todos los precios totales por línea
          const itemTotals = document.querySelectorAll('[data-label="PRECIO (TOTAL)"]');
          itemTotals.forEach(element => {
            if (element && element.textContent) {
              const text = element.textContent.trim();
              const rawValue = parseFloat(text.replace('€', '').trim());
              if (!isNaN(rawValue)) {
                element.textContent = rawValue.toFixed(2) + '€';
              }
            }
          });
        }
        
        // Observar cambios en el DOM
        const observer = new MutationObserver(function(mutations) {
          fixPriceFormat();
        });
        
        // Configurar el observador
        observer.observe(document.body, { 
          childList: true, 
          subtree: true,
          characterData: true,
          attributes: true
        });
        
        // Ejecutar inmediatamente
        fixPriceFormat();
        
        // Añadir a window para acceso desde el componente
        window.fixPriceFormat = fixPriceFormat;
      })();
    `;
    
    // Añadir el script al DOM
    this.renderer.appendChild(document.head, script);
  }
  
  // Método simple para corregir el formato de precios
  private fixPriceFormat(): void {
    setTimeout(() => {
      try {
        // 1. Corregir el total principal
        const totalElement = document.querySelector('[data-label="Total:"] + span');
        if (totalElement) {
          const rawValue = parseFloat(this.total.toString());
          if (!isNaN(rawValue)) {
            totalElement.textContent = rawValue.toFixed(2) + '€';
          }
        }
        
        // 2. Corregir los precios por línea
        const itemTotals = document.querySelectorAll('[data-label="PRECIO (TOTAL)"]');
        itemTotals.forEach(element => {
          if (element && element.textContent) {
            const text = element.textContent.trim();
            const rawValue = parseFloat(text.replace('€', '').trim());
            if (!isNaN(rawValue)) {
              element.textContent = rawValue.toFixed(2) + '€';
            }
          }
        });
      } catch (error) {
        console.error('Error al corregir precios:', error);
      }
    }, 0);
  }

  // Método para continuar comprando
  continuarComprando(): void {
    this.closeCart();
    this.router.navigate(['/productos']);
  }
  
  // Método para aumentar el tamaño del carrito y añadir animaciones
  private enhanceCartSize(): void {
    console.log('CartComponent: Aumentando tamaño de elementos del carrito y añadiendo animaciones');
    
    const styleEl = this.renderer.createElement('style');
    styleEl.id = 'cart-size-enhancement';
    
    // Estilos para hacer elementos más grandes y añadir animación hover
    styleEl.innerHTML = `
      /* Ajustes al popup principal */
      .cart-popup {
        padding: 30px !important;
        max-width: 1005px !important;
      }
      
      /* Aumentar tamaño de elementos de la tabla */
      .cart-table th, 
      .cart-table td,
      .cart-popup th,
      .cart-popup td {
        padding: 17px 15px !important;
      }
      
      /* Aumentar las imágenes y añadir la animación de hover */
      .cart-table .articulo-cell img,
      .cart-popup img {
        width: 45px !important;
        height: 45px !important;
        transition: transform 0.3s ease !important;
      }
      
      /* Efecto hover para las imágenes */
      .cart-table .articulo-cell img:hover,
      .cart-popup img:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15) !important;
      }
      
      /* También aplicamos el efecto a las imágenes de productos en la galería */
      #articulos .articulo img,
      [class*='product'] img {
        transition: transform 0.3s ease !important;
      }
      
      #articulos .articulo img:hover,
      [class*='product'] img:hover {
        transform: scale(1.05) !important;
        z-index: 1 !important;
      }
    `;
    
    // Añadir los nuevos estilos al head del documento
    this.renderer.appendChild(document.head, styleEl);
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.fixPriceFormat();
    }, 100);
  }
  
  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    
    if (this.cartVisibilitySubscription) {
      this.cartVisibilitySubscription.unsubscribe();
    }
    
    // Eliminar event listeners si los hubiera
    document.removeEventListener('click', this.handleOutsideClick);
    
    // Eliminar estilos personalizados
    const customStyles = document.getElementById('cart-size-enhancement');
    if (customStyles) {
      customStyles.remove();
    }
  }
  
  // Método para suscribirse explícitamente a los cambios de visibilidad del carrito
  private listenToCartVisibilityChanges(): void {
    this.cartVisibilitySubscription = this.cartService.isCartOpenObservable.subscribe(isOpen => {
      console.log('CartComponent: cambio de visibilidad del carrito', isOpen);
      
      if (isOpen) {
        setTimeout(() => {
          this.fixPriceFormat();
        }, 200);
      }
    });
  }
  
  // Manejador para clicks fuera del carrito
  private handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // No cerrar si el clic fue dentro del carrito o si estamos eliminando
    if (target.closest('.cart-popup') || target.closest('#carrito') || this.isRemoving) {
      return;
    }
    
    // Cerrar solo si el clic fue realmente fuera del carrito
    if (this.cartService.isCartOpen) {
      this.closeCart();
    }
  };
  
  // Método para parchar el comportamiento de cierre del servicio
  private patchCartServiceCloseMethod(): void {
    // Guardar referencia al método original
    const originalCloseMethod = this.cartService.closeCart;
    
    // Sobrescribir el método en el servicio
    this.cartService.closeCart = () => {
      // LÓGICA MEJORADA: No cerrar si estamos eliminando Y hay productos
      if (this.isRemoving && this.cartItems.length > 0) {
        console.log('Cierre de carrito bloqueado durante eliminación de producto');
        return; // Bloquear el cierre completamente
      }
      
      // En cualquier otro caso, permitir cerrar el carrito
      originalCloseMethod.call(this.cartService);
    };
  }
  
  // Método para convertir CartItems a OrderLines
  convertCartItemsToOrderLines(): void {
    this.orderLines = this.cartItems.map(item => {
      const orderLine: OrderLine = {
        idpedido: 0, // Temporal hasta que se cree el pedido
        idprod: item.id,
        color: item.color || '',
        cantidad: item.cantidad,
        nombre: item.nombre || ''
      };
      return orderLine;
    });
  }
  
  // Método para cerrar el popup del carrito
  closeCart(): void {
    // Solo permitir cierre manual si no estamos en proceso de eliminación
    // O si el carrito está vacío
    if (!this.isRemoving || this.cartItems.length === 0) {
      this.cartService.closeCart();
    } else {
      console.log('CartComponent: Cierre manual bloqueado durante eliminación');
    }
  }
  
  // Método para cerrar el popup del carrito (para template)
  cerrarCarrito(): void {
    this.closeCart();
  }

  // Método para obtener la ruta de la imagen del producto
  getImageSrc(item: CartItem): string {
    // Si el item tiene un objeto producto, usar productService para obtener la imagen
    if (item.producto) {
      return this.productService.getProductImageSrc(item.producto);
    }
    // Si no, intentar usar la imagen almacenada o la imagen por defecto
    return item.imagen || 'assets/images/default.jpg';
  }

  // Método para incrementar la cantidad de un item
  incrementarCantidad(item: CartItem): void {
    console.log('Incrementando cantidad para:', item.nombre);
    
    // Actualizar la cantidad
    this.cartService.updateItemQuantity(item.id, item.color || '', item.cantidad + 1);
    
    // Corregir el formato del total después de actualizar
    setTimeout(() => {
      this.fixPriceFormat();
    }, 100);
  }

  // Método para decrementar la cantidad de un item
  decrementarCantidad(item: CartItem): void {
    if (item.cantidad > 1) {
      console.log('Decrementando cantidad para:', item.nombre);
      
      // Actualizar la cantidad
      this.cartService.updateItemQuantity(item.id, item.color || '', item.cantidad - 1);
      
      // Corregir el formato del total después de actualizar
      setTimeout(() => {
        this.fixPriceFormat();
      }, 100);
    }
  }

  // Método para eliminar un item
  eliminarItem(item: CartItem): void {
    this.confirmRemoveItem(item);
  }

  // Método para calcular el total formateado a 2 decimales
  calcularTotal(): string {
    return this.total.toFixed(2) + '€';
  }

  // Método para procesar la compra
  procesarCompra(): void {
    this.checkout();
  }

  // Método para confirmar eliminación con SweetAlert
  confirmRemoveItem(item: CartItem): void {
    // Activar bandera de eliminación
    this.isRemoving = true;
    console.log('CartComponent: Iniciando proceso de eliminación para', item.nombre);
    
    // Utilizar SweetAlert2 para confirmar
    Swal.fire({
      title: '¿Eliminar este producto?',
      text: '¿Estás seguro de que deseas eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#52667a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      this.zone.run(() => {
        if (result.isConfirmed) {
          // Comprobar cuántos productos quedarán después de eliminar este
          const itemsRemaining = this.cartItems.length - 1;
          
          // Eliminar el item del carrito
          this.removeItem(item.id, item.color || '');
          
          // SOLO resetear isRemoving y cerrar el carrito si no quedarán más artículos
          if (itemsRemaining <= 0) {
            setTimeout(() => {
              this.isRemoving = false;
              this.closeCart();
            }, 500);
          } else {
            // Mantener el carrito abierto cuando quedan más artículos
            setTimeout(() => {
              this.isRemoving = false;
              this.fixPriceFormat();
            }, 500);
          }
        } else {
          // Canceló la eliminación
          this.isRemoving = false;
        }
      });
    });
  }

  // Método para eliminar un item del carrito
  removeItem(id: number, color: string): void {
    // Llamar al método del servicio para eliminar el item
    this.cartService.removeItem(id, color);
  }
  
  // Método para actualizar cantidad desde el componente OrderLine
  updateQuantity(data: {line: OrderLine, newQuantity: number}): void {
    this.cartService.updateItemQuantity(data.line.idprod, data.line.color, data.newQuantity);
    
    // Corregir el formato del total después de actualizar
    setTimeout(() => {
      this.fixPriceFormat();
    }, 100);
  }

  // ✅ MÉTODO CHECKOUT CORREGIDO
  checkout(): void {
    console.log('🛒 Iniciando checkout desde carrito');
    
    // Verificar que el carrito no esté vacío
    if (this.cartItems.length === 0) {
      Swal.fire({
        title: 'El carrito está vacío',
        icon: 'info',
        confirmButtonColor: '#52667a'
      });
      return;
    }

    // Verificar autenticación
    if (!this.authService.currentUserValue) {
      console.log('🔒 Usuario no autenticado, abriendo popup');
      
      // ✅ SOLO popup, NO navegación manual
      this.loginPopupService.openForCheckout('/checkout');
      
      // ✅ Cerrar carrito para limpiar la interfaz
      this.closeCart();
      
      return;
    }

    // ✅ Si está autenticado, proceder al checkout
    console.log('✅ Usuario autenticado, navegando a checkout');
    this.closeCart();
    this.router.navigate(['/checkout']);
  }
}