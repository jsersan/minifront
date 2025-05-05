import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem, Order } from '../models/order';

// Este decorador permite que el servicio sea inyectable en otros componentes/servicios
@Injectable({
  providedIn: 'root' // Hace que este servicio esté disponible a nivel global en la aplicación
})
export class OrderService {
  // URL base para las peticiones a la API de pedidos, obtenida del archivo de entorno
  private apiUrl = `${environment.apiUrl}/pedidos`;

  // Inyección de dependencias: HttpClient para realizar peticiones HTTP
  constructor(private http: HttpClient) { }

  // Método para obtener todos los pedidos de un usuario específico por su ID
  // Devuelve un Observable que emitirá un array de pedidos
  getOrders({ userId }: { userId: number; }): Observable<Order[]> {
    // Realiza una petición GET a la API con el ID del usuario
    // La ruta sigue el formato /pedidos/user/{userId}
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Método para obtener un pedido específico por su ID
  // Devuelve un Observable que emitirá un objeto Order con los detalles del pedido
  getOrder(id: number): Observable<CartItem> {
    // Realiza una petición GET a la URL específica del pedido
    return this.http.get<CartItem>(`${this.apiUrl}/${id}`);
  }

  // Método para crear un nuevo pedido
  // Recibe un objeto Order con los datos del pedido y las líneas del pedido
  // Devuelve un Observable que emitirá el pedido creado con su ID asignado
  createOrder(order: Order): Observable<Order> {
    // Realiza una petición POST enviando los datos completos del pedido
    return this.http.post<Order>(this.apiUrl, order);
  }
}
