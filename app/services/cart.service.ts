// src/app/services/cart.service.ts
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { Product } from '../models/product'

// Interfaz para los elementos del carrito
export interface CartItem {
  id: number
  producto?: Product
  cantidad: number
  color?: string
  talla?: string
  precio: number
  nombre?: string // Añadido para compatibilidad
  imagen?: string // Añadido para compatibilidad
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _cartItems = new BehaviorSubject<CartItem[]>([])

  private _isCartOpen = new BehaviorSubject<boolean>(false);

  // Getters para los observables
  get isCartOpen() {
    return this._isCartOpen.value;
  }
  
  get cartItems() {
    return this._cartItems.asObservable();
  }

  constructor () {
    // Recuperar carrito del localStorage al iniciar
    this.loadCart()
  }

  // Cargar carrito desde localStorage
  private loadCart (): void {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        this._cartItems.next(JSON.parse(savedCart))
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e)
        this._cartItems.next([])
      }
    }
  }

  // Métodos para abrir/cerrar el carrito
  openCart(): void {
    this._isCartOpen.next(true);
    document.body.style.overflow = 'hidden';
    
    // Activar clases en los elementos del DOM
    const cartPopup = document.querySelector('.cart-popup') as HTMLElement;
    const cartOverlay = document.querySelector('.cart-overlay') as HTMLElement;
    
    if (cartPopup) cartPopup.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
  }
  
  closeCart(): void {
    this._isCartOpen.next(false);
    document.body.style.overflow = 'auto';
    
    // Desactivar clases en los elementos del DOM
    const cartPopup = document.querySelector('.cart-popup') as HTMLElement;
    const cartOverlay = document.querySelector('.cart-overlay') as HTMLElement;
    
    if (cartPopup) cartPopup.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
  }

  // Guardar carrito en localStorage
  private saveCart (items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items))
  }

  // Obtener elementos del carrito actual
  getCartItems (): CartItem[] {
    return this._cartItems.getValue()
  }

  // Añadir producto al carrito
  addToCart (
    product: Product,
    quantity: number = 1,
    color?: string,
    size?: string
  ): void {
    const currentItems = this.getCartItems()

    // Buscar si el producto ya está en el carrito con las mismas opciones
    const existingItemIndex = currentItems.findIndex(
      item =>
        item.producto?.id === product.id &&
        item.color === color &&
        item.talla === size
    )

    if (existingItemIndex !== -1) {
      // Si ya existe, incrementamos la cantidad
      const updatedItems = [...currentItems]
      updatedItems[existingItemIndex].cantidad += quantity
      this._cartItems.next(updatedItems)
    } else {
      // Si no existe, añadimos un nuevo item
      const newItem: CartItem = {
        id: Date.now(), // ID único temporal
        producto: product,
        cantidad: quantity,
        color: color,
        talla: size,
        precio: product.precio,
        nombre: product.nombre,
        imagen: `assets/images/${product.carpetaimg}/${product.imagen}`
      }
      this._cartItems.next([...currentItems, newItem])
    }

    // Guardar en localStorage
    this.saveCart(this.getCartItems())
  }

  // Actualizar cantidad de un item
  updateQuantity (itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId)
      return
    }

    const currentItems = this.getCartItems()
    const updatedItems = currentItems.map(item =>
      item.id === itemId ? { ...item, cantidad: quantity } : item
    )

    this._cartItems.next(updatedItems)
    this.saveCart(updatedItems)
  }

  // Para compatibilidad con código existente

  updateItemQuantity (
    itemId: number,
    color: string | undefined,
    quantity: number
  ): void {
    if (quantity <= 0) {
      this.removeItem(itemId, color)
      return
    }

    const currentItems = this.getCartItems()
    const updatedItems = currentItems.map(item => {
      if (item.id === itemId && item.color === color) {
        return { ...item, cantidad: quantity }
      }
      return item
    })

    this._cartItems.next(updatedItems)
    this.saveCart(updatedItems)
  }

  // Eliminar un item del carrito
  removeItem (itemId: number, color?: string): void {
    const currentItems = this.getCartItems()
    let updatedItems

    if (color) {
      // Si se especifica el color, filtramos por ID y color
      updatedItems = currentItems.filter(
        item => !(item.id === itemId && item.color === color)
      )
    } else {
      // Si no se especifica color, filtramos solo por ID
      updatedItems = currentItems.filter(item => item.id !== itemId)
    }

    this._cartItems.next(updatedItems)
    this.saveCart(updatedItems)
  }

  // Vaciar el carrito
  clearCart (): void {
    this._cartItems.next([])
    localStorage.removeItem('cart')
  }

  // Calcular el total del carrito
  getTotal (): number {
    return this.getCartItems().reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    )
  }

  // Alias para getTotal (para compatibilidad)
  getCartTotal (): number {
    return this.getTotal()
  }

  // Obtener el número de items en el carrito
  getItemCount (): number {
    return this.getCartItems().reduce((count, item) => count + item.cantidad, 0)
  }
}
