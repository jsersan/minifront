// checkout.component.ts - versión final corregida y completa

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { Order, OrderLine } from 'src/app/models/order';
import { CartItem } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  // Formulario para datos de envío (opcional, mejorado)
  checkoutForm: FormGroup;
  
  // Array para items del carrito
  cartItems: CartItem[] = [];
  
  // Total del pedido
  total: number = 0;
  
  // Estado de carga
  loading: boolean = false;
  
  // Estados para mostrar diferentes partes del checkout
  showOrder: boolean = true;
  showDelivery: boolean = false;
  showPayment: boolean = false;
  
  // Usuario actual para la plantilla
  currentUser: any;
  
  // Flag para controlar si usar formulario o datos del usuario directamente
  useUserDataDirectly: boolean = true;
  
  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    public productService: ProductService
  ) {
    console.log('🔧 CheckoutComponent inicializado');
    
    // ✅ Formulario mejorado con validaciones más flexibles
    this.checkoutForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required, Validators.minLength(2)]],
      cp: ['', [Validators.required, Validators.pattern(/^\d{4,5}$/)]], // Más flexible: 4-5 dígitos
      telefono: [''] // ✅ Sin validadores requeridos
    });
  }

  ngOnInit(): void {
    console.log('🚀 Inicializando CheckoutComponent');
    
    // Prevenir el scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    
    // MEJORA: Verificar autenticación al inicio
    this.currentUser = this.authService.currentUserValue;
    console.log('👤 Usuario actual:', this.currentUser?.username || 'No autenticado');
    
    if (!this.currentUser) {
      console.warn('⚠️ Usuario no autenticado, redirigiendo al login');
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Para proceder con la compra necesitas estar autenticado',
        icon: 'warning',
        confirmButtonColor: '#52667a'
      }).then(() => {
        this.closeCheckout();
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' }});
      });
      return;
    }
    
    // ✅ Verificar integridad de datos del usuario
    console.log('🔍 Verificando datos del usuario:', {
      nombre: this.currentUser?.nombre,
      direccion: this.currentUser?.direccion,
      ciudad: this.currentUser?.ciudad,
      cp: this.currentUser?.cp,
      email: this.currentUser?.email
    });
    
    // ✅ Decidir si usar datos del usuario directamente o formulario
    const hasCompleteUserData = this.currentUser.nombre && 
                               this.currentUser.direccion && 
                               this.currentUser.ciudad && 
                               this.currentUser.cp;
    
    if (hasCompleteUserData) {
      console.log('✅ Usuario tiene datos completos, usando datos directamente');
      this.useUserDataDirectly = true;
    } else {
      console.log('⚠️ Usuario con datos incompletos, usando formulario');
      this.useUserDataDirectly = false;
    }
    
    // Cargar los items del carrito
    this.cartService.cartItems.subscribe(items => {
      console.log('🛒 Items del carrito recibidos:', items.length);
      
      // Mapear los items del carrito para asegurar compatibilidad de tipos
      this.cartItems = items.map(item => {
        return {
          id: item.id,
          nombre: item.nombre || '',
          color: item.color || 'Estándar',
          cantidad: item.cantidad,
          precio: item.precio,
          imagen: item.imagen || '',
          producto: typeof item.producto === 'object' ? JSON.stringify(item.producto) : (item.producto || '')
        } as CartItem;
      });
      
      // Calcular el total
      this.total = this.cartService.getCartTotal();
      console.log('💰 Total calculado:', this.total);
      
      // MEJORA: Verificar si el carrito está vacío con mensaje específico
      if (this.cartItems.length === 0) {
        console.warn('⚠️ Carrito vacío, cerrando checkout');
        Swal.fire({
          title: 'Carrito vacío',
          text: 'No hay productos en el carrito para procesar',
          icon: 'info',
          confirmButtonColor: '#52667a'
        }).then(() => {
          this.closeCheckout();
        });
      }
    });
    
    // ✅ Prellenar el formulario con datos del usuario mejorado
    if (this.currentUser && !this.useUserDataDirectly) {
      console.log('📝 Prellenando formulario con datos del usuario');
      const userData = this.preprocessUserData(this.currentUser);
      
      this.checkoutForm.patchValue(userData);
      this.checkoutForm.updateValueAndValidity();
      
      // Debug del estado del formulario
      console.log('📊 Estado del formulario después de prellenar:', {
        valid: this.checkoutForm.valid,
        errors: this.getFormErrors(),
        values: this.checkoutForm.value
      });
    }
    
    // Listener para cerrar con tecla ESC
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  ngOnDestroy(): void {
    console.log('🧹 Destruyendo CheckoutComponent');
    
    // Restaurar el scroll del body al destruir el componente
    document.body.style.overflow = 'auto';
    
    // Remover listener del ESC
    document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  // ✅ Método para preprocessar y validar datos del usuario
  private preprocessUserData(user: any) {
    return {
      nombre: user.nombre || '',
      direccion: user.direccion || '',
      ciudad: user.ciudad || '',
      cp: user.cp || '',
      telefono: user.telefono || ''
    };
  }

  // ✅ Método helper para obtener errores del formulario
  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  /**
   * Método para obtener la ruta de la imagen del producto
   */
  getImageSrc(item: CartItem): string {
    if (item.producto) {
      if (typeof item.producto === 'string') {
        try {
          const productoObj = JSON.parse(item.producto);
          return this.productService.getProductImageSrc(productoObj);
        } catch (e) {
          return 'assets/images/default.jpg';
        }
      } else {
        return this.productService.getProductImageSrc(item.producto);
      }
    }
    return item.imagen || 'assets/images/default.jpg';
  }

  /**
   * Maneja errores de carga de imagen
   */
  handleImageError(event: any): void {
    this.productService.handleImageError(event);
  }

  /**
   * Maneja la tecla ESC para cerrar el modal
   */
  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      console.log('⌨️ Tecla ESC presionada, cerrando checkout');
      this.closeCheckout();
    }
  }

  /**
   * Cierra el modal de checkout y navega de vuelta
   */
  closeCheckout(): void {
    console.log('🚪 Cerrando checkout');
    document.body.style.overflow = 'auto';
    this.router.navigate(['/']);
  }

  /**
   * ✅ Procesa el pedido (método principal MEJORADO Y COMPLETO)
   */
  placeOrder(): void {
    console.log('🚀 Iniciando procesamiento del pedido...');
    
    // VERIFICACIÓN 1: Autenticación
    if (!this.currentUser) {
      console.error('❌ Error de autenticación durante el procesamiento');
      Swal.fire({
        title: 'Error de autenticación',
        text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        icon: 'error',
        confirmButtonColor: '#52667a'
      }).then(() => {
        this.closeCheckout();
        this.router.navigate(['/login']);
      });
      return;
    }

    // VERIFICACIÓN 2: Carrito no vacío
    if (this.cartItems.length === 0) {
      console.warn('⚠️ Intento de procesar pedido con carrito vacío');
      Swal.fire({
        title: 'El carrito está vacío',
        text: 'No puedes procesar un pedido sin productos',
        icon: 'warning',
        confirmButtonColor: '#52667a'
      });
      return;
    }

    // VERIFICACIÓN 3: Datos de usuario o formulario
    let shippingData: any;
    
    if (this.useUserDataDirectly) {
      // ✅ Usar datos del usuario directamente
      console.log('📋 Usando datos del usuario directamente');
      shippingData = {
        nombre: this.currentUser.nombre,
        direccion: this.currentUser.direccion,
        ciudad: this.currentUser.ciudad,
        cp: this.currentUser.cp
      };
      
      // Verificar que los datos están completos
      if (!shippingData.nombre || !shippingData.direccion || !shippingData.ciudad || !shippingData.cp) {
        console.warn('⚠️ Datos del usuario incompletos');
        Swal.fire({
          title: 'Perfil incompleto',
          text: 'Para proceder con la compra necesitas completar tu perfil (nombre, dirección, ciudad, código postal)',
          icon: 'warning',
          confirmButtonColor: '#52667a',
          showCancelButton: true,
          cancelButtonText: 'Más tarde',
          confirmButtonText: 'Completar perfil'
        }).then((result) => {
          if (result.isConfirmed) {
            this.closeCheckout();
            this.router.navigate(['/profile']);
          }
        });
        return;
      }
    } else {
      // ✅ Usar datos del formulario
      console.log('📋 Usando datos del formulario');
      console.log('📊 Estado del formulario:', {
        valid: this.checkoutForm.valid,
        errors: this.getFormErrors(),
        values: this.checkoutForm.value
      });

      if (this.checkoutForm.invalid) {
        console.warn('⚠️ Formulario inválido:', this.getFormErrors());
        
        // Marcar todos los campos como tocados para mostrar errores
        Object.keys(this.checkoutForm.controls).forEach(key => {
          const control = this.checkoutForm.get(key);
          control?.markAsTouched();
        });

        // Mostrar mensaje específico de error
        const errorMessages = Object.keys(this.getFormErrors()).map(field => {
          return `${field}: ${this.getErrorMessage(field)}`;
        }).join('\n');

        Swal.fire({
          title: 'Datos incompletos',
          text: `Por favor corrige los siguientes errores:\n${errorMessages}`,
          icon: 'warning',
          confirmButtonColor: '#52667a'
        });
        return;
      }
      
      shippingData = this.checkoutForm.value;
    }
    
    console.log('📦 Datos de envío a usar:', shippingData);
    
    // PROCESAMIENTO DEL PEDIDO
    this.loading = true;
    console.log('⏳ Iniciando carga...');
    
    try {
      // ✅ Crear las líneas de pedido con estructura correcta
      const orderLines: OrderLine[] = this.cartItems.map(item => {
        return {
          idpedido: 0, // Se asignará en el backend
          idprod: item.id,
          color: item.color || 'Estándar',
          cantidad: item.cantidad,
          nombre: item.nombre || ''
        };
      });
      
      // ✅ Crear el objeto de pedido simplificado para el backend
      const order: Order = {
        id: 0, // Se asignará en el backend
        usuario_id: this.currentUser.id,
        fecha: new Date().toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
        total: this.total,
        lineas: orderLines
      };
      
      console.log('📦 Pedido a crear:', order);
      
      // ✅ Llamar al servicio para crear el pedido
      this.orderService.createOrder(order).subscribe({
        next: (response) => {
          console.log('✅ Pedido creado exitosamente:', response);
          this.loading = false;
          
          // Vaciar el carrito
          this.cartService.clearCart();
          console.log('🧹 Carrito vaciado');
          
          // Mensaje de éxito mejorado
          Swal.fire({
            title: '¡Pago realizado con éxito!',
            text: `Tu pedido ha sido procesado correctamente. Número de pedido: ${response.id}`,
            icon: 'success',
            confirmButtonColor: '#52667a',
            confirmButtonText: 'Ver mis pedidos'
          }).then(() => {
            this.closeCheckout();
            this.router.navigate(['/profile']);
          });
        },
        error: (error) => {
          console.error('❌ Error al crear el pedido:', error);
          this.loading = false;
          
          // Mensaje de error mejorado
          const errorMessage = error.message || 'Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo.';
          
          Swal.fire({
            title: 'Error al procesar el pedido',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#52667a',
            confirmButtonText: 'Intentar de nuevo'
          });
          
          // Si es error de autenticación, redirigir al login
          if (error.status === 401) {
            console.warn('🔒 Error de autenticación, cerrando sesión');
            this.authService.logout();
            this.closeCheckout();
            this.router.navigate(['/login']);
          }
        }
      });
    } catch (error) {
      console.error('💥 Error inesperado:', error);
      this.loading = false;
      
      Swal.fire({
        title: 'Error inesperado',
        text: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#52667a'
      });
    }
  }
  
  // MÉTODOS DE NAVEGACIÓN Y VALIDACIÓN (mantenidos para compatibilidad)
  
  goToDelivery(): void {
    this.showOrder = false;
    this.showDelivery = true;
    this.showPayment = false;
  }
  
  goToPayment(): void {
    if (!this.useUserDataDirectly && this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        const control = this.checkoutForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.showOrder = false;
    this.showDelivery = false;
    this.showPayment = true;
  }
  
  goToOrder(): void {
    this.showOrder = true;
    this.showDelivery = false;
    this.showPayment = false;
  }
  
  // Gestionar errores de formulario
  hasError(field: string): boolean {
    if (this.useUserDataDirectly) return false;
    
    const control = this.checkoutForm.get(field);
    return control ? control.invalid && control.touched : false;
  }
  
  getErrorMessage(field: string): string {
    if (this.useUserDataDirectly) return '';
    
    const control = this.checkoutForm.get(field);
    
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    
    if (control.hasError('pattern')) {
      if (field === 'cp') {
        return 'Debe ser un código postal válido de 4-5 dígitos';
      }
      if (field === 'telefono') {
        return 'Debe ser un número de teléfono válido de 9 dígitos';
      }
    }
    
    return 'Campo inválido';
  }

  // Métodos auxiliares mantenidos para compatibilidad
  private convertOrderLinesToCartItems(orderLines: OrderLine[]): CartItem[] {
    return orderLines.map(line => {
      return {
        id: line.idprod,
        nombre: line.nombre || '',
        cantidad: line.cantidad,
        color: line.color,
        precio: this.findCartItemPrice(line.idprod, line.color),
        imagen: this.findCartItemImage(line.idprod, line.color),
        producto: this.findCartItemProducto(line.idprod, line.color)
      } as CartItem;
    });
  }
  
  private findCartItemPrice(id: number, color: string): number {
    const item = this.cartItems.find(i => i.id === id && i.color === color);
    return item?.precio ?? 0; // ✅ Usar optional chaining y nullish coalescing
  }
  
  private findCartItemImage(id: number, color: string): string {
    const item = this.cartItems.find(i => i.id === id && i.color === color);
    return item?.imagen ?? ''; // ✅ Usar optional chaining y nullish coalescing
  }
  
  private findCartItemProducto(id: number, color: string): string {
    const item = this.cartItems.find(i => i.id === id && i.color === color);
    return item?.producto ?? ''; // ✅ Usar optional chaining y nullish coalescing
  }
}