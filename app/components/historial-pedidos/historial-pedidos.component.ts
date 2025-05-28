// historial-pedidos.component.ts - ARCHIVO COMPLETO

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order';
import { User } from '../../models/user';

// Interface extendida para incluir el estado de expansión
interface PedidoExpandible extends Order {
  expanded?: boolean;
}

@Component({
  selector: 'app-historial-pedidos',
  templateUrl: './historial-pedidos.component.html',
  styleUrls: ['./historial-pedidos.component.scss']
})
export class HistorialPedidosComponent implements OnInit {
  
  // Propiedades del componente
  pedidos: PedidoExpandible[] = [];
  loading: boolean = true;
  currentUser: User | null = null;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private orderService: OrderService
  ) {
    console.log('🔧 HistorialPedidosComponent inicializado');
  }

  ngOnInit(): void {
    console.log('🚀 Inicializando HistorialPedidosComponent');
    
    // Obtener usuario actual
    this.currentUser = this.authService.currentUserValue;
    console.log('👤 Usuario actual:', this.currentUser?.username || 'No autenticado');
    
    if (this.currentUser && this.currentUser.id) {
      this.cargarPedidos();
    } else {
      console.warn('⚠️ Usuario no autenticado');
      this.loading = false;
      this.error = 'Usuario no autenticado';
    }
  }

  /**
   * Carga los pedidos del usuario usando OrderService
   */
  cargarPedidos(): void {
    if (!this.currentUser?.id) {
      console.error('❌ No hay usuario autenticado');
      this.loading = false;
      return;
    }

    console.log('📦 Cargando pedidos del usuario:', this.currentUser.id);
    this.loading = true;
    this.error = null;
    
    this.orderService.getOrders({ userId: this.currentUser.id }).subscribe({
      next: (orders: Order[]) => {
        console.log('📥 Pedidos recibidos del OrderService:', orders);
        
        // Procesar pedidos y añadir estado de expansión
        this.pedidos = orders.map(pedido => ({
          ...pedido,
          expanded: false // Inicialmente todos cerrados
        }));
        
        // Ordenar por número de referencia descendente (ID más alto primero)
        this.pedidos.sort((a, b) => (b.id || 0) - (a.id || 0));
        
        console.log('✅ Pedidos procesados:', this.pedidos.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('💥 Error al cargar pedidos:', error);
        this.loading = false;
        this.error = 'Error al cargar los pedidos. Por favor, inténtalo de nuevo.';
        
        // Opcional: Mostrar error con SweetAlert2 si está disponible
        // Swal.fire({
        //   title: 'Error',
        //   text: 'No se pudieron cargar los pedidos',
        //   icon: 'error'
        // });
      }
    });
  }

  /**
   * Toggle para expandir/colapsar un pedido
   */
  togglePedido(index: number): void {
    if (this.pedidos[index]) {
      console.log(`🔄 Toggle pedido ${this.pedidos[index].id}`);
      this.pedidos[index].expanded = !this.pedidos[index].expanded;
    }
  }

  /**
   * Obtiene las líneas de un pedido específico
   */
  getLineasPedido(idPedido: number): any[] {
    const pedido = this.pedidos.find(p => p.id === idPedido);
    return pedido?.lineas || [];
  }

  /**
   * Formatea la fecha para mostrar en formato legible
   * Acepta múltiples formatos de entrada y devuelve DD/MM/YYYY
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    
    try {
      // Si la fecha viene en formato YYYY-MM-DD, convertir a DD/MM/YYYY
      if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Si viene en formato ISO o cualquier otro, intentar parsear
      const date = new Date(fecha);
      
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Fecha inválida:', fecha);
        return fecha; // Devolver la fecha original si no se puede parsear
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.warn('⚠️ Error al formatear fecha:', fecha, error);
      return fecha; // Si hay error, devolver la fecha original
    }
  }

  /**
   * Calcula el precio de una línea específica
   * Distribuye el precio total del pedido proporcionalmente
   */
  calcularPrecioLinea(linea: any): number {
    if (!linea || !linea.cantidad) return 0;
    
    const pedido = this.pedidos.find(p => p.id === linea.idpedido);
    if (!pedido || !pedido.lineas || pedido.lineas.length === 0) return 0;
    
    // Calcular el total de cantidades en el pedido
    const totalCantidades = pedido.lineas.reduce((sum: number, l: any) => {
      return sum + (l.cantidad || 0);
    }, 0);
    
    if (totalCantidades > 0 && pedido.total) {
      // Precio proporcional basado en la cantidad
      const precioProporcional = (pedido.total * linea.cantidad) / totalCantidades;
      return Math.round(precioProporcional * 100) / 100; // Redondear a 2 decimales
    }
    
    return 0;
  }

  /**
   * Recargar pedidos (útil para botón de refresh)
   */
  recargarPedidos(): void {
    console.log('🔄 Recargando pedidos...');
    this.cargarPedidos();
  }

  /**
   * Obtener número total de productos en un pedido
   */
  getTotalProductosPedido(idPedido: number): number {
    const lineasDelPedido = this.getLineasPedido(idPedido);
    return lineasDelPedido.reduce((sum, linea) => sum + (linea.cantidad || 0), 0);
  }

  /**
   * Verificar si un pedido tiene productos
   */
  pedidoTieneProductos(idPedido: number): boolean {
    return this.getLineasPedido(idPedido).length > 0;
  }

  /**
   * Obtener el estado del pedido (si está disponible)
   */
  getEstadoPedido(pedido: PedidoExpandible): string {
    // Si el modelo Order tiene un campo 'estado', úsalo
    return (pedido as any).estado || 'Completado';
  }

  /**
   * Verificar si hay pedidos cargados
   */
  hasPedidos(): boolean {
    return this.pedidos && this.pedidos.length > 0;
  }

  /**
   * Obtener mensaje cuando no hay pedidos
   */
  getNoOrdersMessage(): string {
    if (this.error) {
      return this.error;
    }
    return 'No tienes pedidos aún. Cuando realices tu primera compra, aparecerá aquí tu historial.';
  }
}