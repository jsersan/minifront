// checkout.component.ts actualizado con currentUser

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderLine } from 'src/app/models/order';
import { CartItem } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: [] // Eliminar la referencia a checkout.component.css si no existe
})
export class CheckoutComponent implements OnInit {
  // Formulario para datos de envío
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
  
  // Añadir propiedad currentUser para la plantilla
  currentUser: any;
  
  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {
    // Inicialización del formulario con validaciones
    this.checkoutForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required]],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]]
    });
  }

  ngOnInit(): void {
    // Cargar los items del carrito
    this.cartService.cartItems.subscribe(items => {
      // Mapear los items del carrito para asegurar compatibilidad de tipos
      this.cartItems = items.map(item => {
        return {
          id: item.id,
          nombre: item.nombre || '',
          color: item.color || '',
          cantidad: item.cantidad,
          precio: item.precio,
          imagen: item.imagen,
          producto: typeof item.producto === 'object' ? JSON.stringify(item.producto) : item.producto
        } as CartItem;
      });
      
      // Calcular el total
      this.total = this.cartService.getCartTotal();
      
      // Verificar si el carrito está vacío y redireccionar
      if (this.cartItems.length === 0) {
        this.router.navigate(['/']);
      }
    });
    
    // Obtener usuario actual y almacenarlo en la propiedad currentUser
    this.currentUser = this.authService.currentUserValue;
    
    // Prellenar el formulario con datos del usuario si está disponible
    if (this.currentUser) {
      this.checkoutForm.patchValue({
        nombre: this.currentUser.nombre || '',
        direccion: this.currentUser.direccion || '',
        ciudad: this.currentUser.ciudad || '',
        codigoPostal: this.currentUser.cp || '', // Nota: en la plantilla usas cp, no codigoPostal
        telefono: this.currentUser.telefono || ''
      });
    }
  }

  // Renombrar processOrder a placeOrder para que coincida con la plantilla
  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.checkoutForm.controls).forEach(key => {
        const control = this.checkoutForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    
    // Crear las líneas de pedido
    const orderLines: OrderLine[] = this.cartItems.map(item => {
      return {
        idpedido: 0,
        idprod: item.id,
        color: item.color || '',
        cantidad: item.cantidad, // Usar cantidad, no cant
        nombre: item.nombre || ''
      };
    });
    
    // Crear el objeto de pedido
    const order: Order = {
      id: 0, // Este valor lo asignará el backend
      usuario_id: this.currentUser?.id || 0,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      total: this.total,
      direccion_envio: this.checkoutForm.value.direccion,
      metodo_pago: 'Efectivo', // Valor por defecto o el que seleccione el usuario
      lineas: orderLines
    };
    
    // Llamar al servicio para crear el pedido
    this.orderService.createOrder(order).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Vaciar el carrito
        this.cartService.clearCart();
        
        // Mostrar mensaje de éxito
        Swal.fire({
          title: '¡Pedido realizado con éxito!',
          text: `Tu número de pedido es: ${response.id}`,
          icon: 'success',
          confirmButtonColor: '#52667a'
        }).then(() => {
          // Redirigir al usuario a su perfil o a la página de confirmación
          this.router.navigate(['/perfil']);
        });
      },
      error: (error) => {
        this.loading = false;
        
        // Mostrar mensaje de error
        Swal.fire({
          title: 'Error al procesar el pedido',
          text: error.message || 'Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#52667a'
        });
      }
    });
  }
  
  // Método para convertir OrderLine[] a CartItem[]
  private convertOrderLinesToCartItems(orderLines: OrderLine[]): CartItem[] {
    return orderLines.map(line => {
      return {
        id: line.idprod,
        nombre: line.nombre,
        cantidad: line.cantidad,
        color: line.color,
        precio: this.findCartItemPrice(line.idprod, line.color),
        imagen: this.findCartItemImage(line.idprod, line.color),
        producto: this.findCartItemProducto(line.idprod, line.color)
      } as CartItem;
    });
  }
  
  // Métodos auxiliares
  private findCartItemPrice(id: number, color: string): number {
    const item = this.cartItems.find(i => i.id === id && i.color === color);
    return item ? item.precio : 0;
  }
  
  private findCartItemImage(id: number, color: string): string {
    const item = this.cartItems.find(i => i.id === id && i.color === color);
    return item ? item.imagen : '';
  }
  
  private findCartItemProducto(id: number, color: string): string {
    const item = this.cartItems.find(i => i.id === id && i.color === color);
    return item ? item.producto : '';
  }
  
  // Navegar a diferentes secciones del checkout
  goToDelivery(): void {
    this.showOrder = false;
    this.showDelivery = true;
    this.showPayment = false;
    window.scrollTo(0, 0);
  }
  
  goToPayment(): void {
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        const control = this.checkoutForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.showOrder = false;
    this.showDelivery = false;
    this.showPayment = true;
    window.scrollTo(0, 0);
  }
  
  goToOrder(): void {
    this.showOrder = true;
    this.showDelivery = false;
    this.showPayment = false;
    window.scrollTo(0, 0);
  }
  
  // Gestionar errores de formulario
  hasError(field: string): boolean {
    const control = this.checkoutForm.get(field);
    return control ? control.invalid && control.touched : false;
  }
  
  getErrorMessage(field: string): string {
    const control = this.checkoutForm.get(field);
    
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    
    if (control.hasError('pattern')) {
      if (field === 'codigoPostal') {
        return 'Debe ser un código postal válido de 5 dígitos';
      }
      if (field === 'telefono') {
        return 'Debe ser un número de teléfono válido de 9 dígitos';
      }
    }
    
    return 'Campo inválido';
  }
}