import { Component, OnInit, HostListener, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderLine } from 'src/app/models/order';
import { CartItem } from '../../services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: []
})
export class CartComponent implements OnInit, OnDestroy {
  // Array para almacenar los items del carrito
  cartItems: CartItem[] = [];
  
  // Array para las líneas de pedido
  orderLines: OrderLine[] = [];
  
  // Variable para almacenar el total del carrito
  total: number = 0;
  
  // Variable para controlar si estamos en proceso de eliminar
  private isRemoving: boolean = false;
  
  // Constructor con inyección de dependencias
  constructor(
    public cartService: CartService,  // Para acceder al servicio del carrito
    private authService: AuthService,  // Para verificar si el usuario está autenticado
    private router: Router,            // Para la navegación programática
    private zone: NgZone              // Para ejecutar código fuera de la zona de Angular
  ) { }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    // Suscripción al observable de items del carrito
    this.cartService.cartItems.subscribe({
      next: (items) => {
        // Actualizar los items del carrito en el componente

        this.cartService.cartItems.subscribe({
          next: (items) => {
            // Aquí puedes mapear los items para asegurarte que tienen la estructura correcta
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
        this.total = this.cartService.getCartTotal();
        
        // Si el carrito está vacío y estaba abierto, cerrarlo después de un breve retraso
        // Solo si no estábamos en medio de otra operación de eliminación
        if (items.length === 0 && this.cartService.isCartOpen && !this.isRemoving) {
          setTimeout(() => {
            this.closeCart();
          }, 500);
        }
        
        // Reset de la bandera de eliminar
        this.isRemoving = false;
          }
        });
      }
    });
    
    // Detectar pulsación de tecla Escape para cerrar el carrito
    this.setupEscapeListener();
    
    // Configurar el container de SweetAlert2 para asegurar que esté por encima del carrito
    this.configureSweetAlert();
    
    // Sobrescribir el método closeCart del servicio para evitar cierres no deseados
    this.patchCartServiceCloseMethod();
  }
  
  // Método para parchar el comportamiento de cierre del servicio
  private patchCartServiceCloseMethod(): void {
    // Guardar referencia al método original
    const originalCloseMethod = this.cartService.closeCart;
    
    // Sobrescribir el método en el servicio
    this.cartService.closeCart = () => {
      // Solo permitir el cierre si no estamos en proceso de eliminación
      // O si el carrito está vacío
      if (!this.isRemoving || this.cartItems.length === 0) {
        originalCloseMethod.call(this.cartService);
      } else {
        console.log('Cierre de carrito bloqueado durante eliminación de producto');
      }
    };
  }
  
  // Configurar SweetAlert2 para que sus elementos estén por encima del carrito
  private configureSweetAlert(): void {
    // Crear un estilo en la cabecera del documento para sobrescribir el z-index de SweetAlert2
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .swal2-container {
        z-index: 9999 !important;
      }
      .swal2-popup {
        z-index: 10000 !important;
      }
    `;
    document.head.appendChild(styleEl);
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
  
  // Escuchar el evento keydown para cerrar con Escape
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.cartService.isCartOpen && !this.isRemoving) {
      this.closeCart();
    }
  }

  // Método para cerrar el popup del carrito
  closeCart(): void {
    // Solo permitir cierre manual si no estamos en proceso de eliminación
    if (!this.isRemoving) {
      this.cartService.closeCart();
    }
  }
  
  // Configurar listener para cerrar al hacer clic fuera del carrito
  setupEscapeListener(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (this.cartService.isCartOpen && 
          !target.closest('.cart-popup') && 
          !target.closest('#carrito') &&
          !this.isRemoving) {
        this.closeCart();
      }
    });
  }

  // Método para cambiar cantidad evitando la propagación del evento
  changeQuantity(event: Event, id: number, color: string | undefined, newQuantity: number): void {
    // Detener propagación del evento para evitar que se cierre el carrito
    event.preventDefault();
    event.stopPropagation();
    
    // Solo actualizar si la cantidad es válida
    if (newQuantity >= 1) {
      // Usar cadena vacía como respaldo si el color es undefined
      this.cartService.updateItemQuantity(id, color || '', newQuantity);
    }
  }

  // Método para confirmar eliminación con SweetAlert
  confirmRemoveItem(event: Event, id: number, color: string | undefined): void {
    // Detener propagación del evento para evitar que se cierre el carrito
    event.preventDefault();
    event.stopPropagation();
    
    // Activar bandera de eliminación
    this.isRemoving = true;
    
    // Utilizar SweetAlert2 con z-index alto
    Swal.fire({
      title: '¿Eliminar este producto?',
      text: '¿Estás seguro de que deseas eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#52667a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,  // Evitar que se cierre al hacer clic fuera
      allowEscapeKey: false      // Evitar que se cierre con Escape
    }).then((result) => {
      // Ejecutar en la zona de Angular para asegurar detección de cambios
      this.zone.run(() => {
        if (result.isConfirmed) {
          // Comprobar si era el último producto
          const wasLastItem = this.cartItems.length === 1;
          
          // Eliminar el item del carrito
         this.removeItem(id, color || '');
          
          // Solo cerrar el carrito si era el último producto
          if (wasLastItem) {
            // Dar tiempo para que se actualice la UI
            setTimeout(() => {
              this.isRemoving = false;
              this.closeCart();
            }, 500);
          } else {
            // Mantener el carrito abierto
            this.isRemoving = false;
          }
        } else {
          // Si canceló la eliminación
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
  }

  // Método para proceder al checkout
  checkout(): void {
    // Verificar que el carrito no esté vacío
    if (this.cartItems.length === 0) {
      // Mostrar alerta si el carrito está vacío
      Swal.fire({
        title: 'El carrito está vacío',
        icon: 'info',
        confirmButtonColor: '#52667a'
      });
      return;
    }

    // Verificar que el usuario esté autenticado
    if (!this.authService.currentUserValue) {
      // Mostrar alerta si el usuario no está autenticado
      Swal.fire({
        title: 'Debes iniciar sesión para poder procesar la compra',
        icon: 'error',
        confirmButtonColor: '#52667a'
      }).then(() => {
        // Cerrar el carrito antes de redirigir
        this.closeCart();
        // Redirigir a la página de login con retorno a checkout
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: '/checkout' } 
        });
      });
      return;
    }

    // Si todo está bien, navegar a la página de checkout
    this.closeCart(); // Cerrar el carrito primero
    this.router.navigate(['/checkout']);
  }
}