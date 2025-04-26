import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { Router } from '@angular/router';

// Este decorador permite que el servicio sea inyectable en otros componentes/servicios
@Injectable({
  providedIn: 'root' // Hace que este servicio esté disponible a nivel global en la aplicación
})
export class AuthService {
  // URL base para las peticiones a la API de usuarios
  private apiUrl = `${environment.apiUrl}/users`;
  
  // BehaviorSubject mantiene el estado del usuario actual y permite suscribirse a cambios
  // El valor inicial se obtiene del localStorage (si existe) o null si no hay usuario
  private currentUserSubject: BehaviorSubject<User | null>;
  
  // Observable público que los componentes pueden usar para recibir actualizaciones
  // cuando cambia el usuario actual
  public currentUser: Observable<User | null>;

  // Inyección de dependencias: HttpClient para peticiones HTTP y Router para navegación
  constructor(private http: HttpClient, private router: Router) {
    // Intentar obtener el usuario desde localStorage (persistencia entre recargas)
    const storedUser = localStorage.getItem('currentUser');
    
    // Inicializar el BehaviorSubject con el usuario almacenado o null
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    
    // Exponer currentUserSubject como un Observable para componentes
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Getter para acceder al valor actual del usuario sin suscribirse al Observable
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Método para iniciar sesión
  login(username: string, password: string): Observable<User> {
    // Enviar credenciales al servidor
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map(user => {
          // Al recibir respuesta exitosa, guardar usuario en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Notificar a los suscriptores que hay un nuevo usuario actual
          this.currentUserSubject.next(user);
          
          return user;
        })
      );
  }

  // Método para registrar un nuevo usuario
  register(user: User): Observable<User> {
    // Enviar datos del nuevo usuario al servidor
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  // Método para actualizar los datos de un usuario existente
  updateUser(user: User): Observable<User> {
    // Enviar los datos actualizados al servidor
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user)
      .pipe(
        map(updatedUser => {
          // Si el usuario actualizado es el usuario actual, actualizar en localStorage
          if (this.currentUserValue && this.currentUserValue.id === updatedUser.id) {
            const userToStore = { ...updatedUser };
            delete userToStore.password; // No almacenar la contraseña por seguridad
            
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            
            // Notificar a los suscriptores del cambio
            this.currentUserSubject.next(userToStore);
          }
          
          return updatedUser;
        })
      );
  }

  // Método para cerrar sesión
  logout() {
    // Eliminar usuario del localStorage
    localStorage.removeItem('currentUser');
    
    // Actualizar el BehaviorSubject con null (sin usuario)
    this.currentUserSubject.next(null);
    
    // Redirigir al usuario a la página de inicio
    this.router.navigate(['/']);
  }

  // Método para verificar si el usuario actual es administrador
  isAdmin(): boolean {
    return this.currentUserValue?.username === 'admin';
  }
}