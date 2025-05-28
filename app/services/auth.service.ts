import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    console.log('🔧 AuthService inicializado');
    console.log('📍 API URL:', this.apiUrl);
    
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
    
    if (storedUser) {
      console.log('👤 Usuario restaurado del localStorage:', JSON.parse(storedUser));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    console.log('🚀 Intentando login para usuario:', username);
    console.log('📡 URL de login:', `${this.apiUrl}/login`);
    
    const loginData = { username, password };
    console.log('📦 Datos de login:', { username, password: '***' });

    return this.http.post<User>(`${this.apiUrl}/login`, loginData)
      .pipe(
        map(user => {
          console.log('✅ Login exitoso, respuesta del servidor:', user);
          
          // Guardar en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('💾 Usuario guardado en localStorage');
          
          // Actualizar BehaviorSubject
          this.currentUserSubject.next(user);
          console.log('🔄 Usuario actualizado en BehaviorSubject');
          
          return user;
        }),
        catchError(this.handleError('login'))
      );
  }

  register(user: any): Observable<User> {
    console.log('🚀 Intentando registro de usuario:', user.username);
    console.log('📡 URL de registro:', `${this.apiUrl}/register`);
    console.log('📦 Datos de registro:', { ...user, password: '***' });

    return this.http.post<User>(`${this.apiUrl}/register`, user)
      .pipe(
        map(response => {
          console.log('✅ Registro exitoso, respuesta del servidor:', response);
          return response;
        }),
        catchError(this.handleError('registro'))
      );
  }

  updateUser(user: User): Observable<User> {
    console.log('🚀 Actualizando usuario:', user.id);
    console.log('📡 URL de actualización:', `${this.apiUrl}/${user.id}`);

    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user)
      .pipe(
        map(updatedUser => {
          console.log('✅ Usuario actualizado:', updatedUser);
          
          if (this.currentUserValue && this.currentUserValue.id === updatedUser.id) {
            const userToStore = { ...updatedUser };
            delete userToStore.password;
            
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            this.currentUserSubject.next(userToStore);
            console.log('🔄 Usuario actual actualizado');
          }
          
          return updatedUser;
        }),
        catchError(this.handleError('actualización de usuario'))
      );
  }

  logout() {
    console.log('👋 Cerrando sesión de usuario');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  isAdmin(): boolean {
    const isAdminUser = this.currentUserValue?.username === 'admin';
    console.log('🔐 Verificando si es admin:', isAdminUser);
    return isAdminUser;
  }

  /**
   * Obtener el token JWT del usuario actual
   * AÑADIDO: Para compatibilidad con OrderService
   */
  getToken(): string | null {
    const currentUser = this.currentUserValue;
    if (currentUser && currentUser.token) {
      console.log('🔑 Token obtenido para usuario:', currentUser.username);
      return currentUser.token;
    }
    console.warn('⚠️ No hay token disponible - usuario no autenticado');
    return null;
  }

  /**
   * Verificar si el usuario está autenticado
   * AÑADIDO: Para compatibilidad con OrderService
   */
  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    const hasToken = this.getToken();
    const isAuthenticated = !!(user && hasToken);
    
    console.log('🔍 Verificando autenticación:', {
      hasUser: !!user,
      hasToken: !!hasToken,
      isAuthenticated
    });
    
    return isAuthenticated;
  }

  // Método mejorado para manejo de errores
  private handleError(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`❌ Error en ${operation}:`, error);
      
      let userMessage = 'Ha ocurrido un error inesperado';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        console.error('💻 Error del cliente:', error.error.message);
        userMessage = 'Error de conexión. Verifica tu internet.';
      } else {
        // Error del servidor
        console.error(`🔥 Error del servidor ${error.status}:`, error.error);
        
        switch (error.status) {
          case 0:
            userMessage = 'No se puede conectar al servidor. ¿Está el backend ejecutándose?';
            console.error('🚨 CORS o servidor no accesible en:', this.apiUrl);
            break;
          case 401:
            userMessage = 'Usuario o contraseña incorrectos';
            break;
          case 400:
            userMessage = error.error?.message || 'Datos inválidos';
            break;
          case 409:
            userMessage = 'El usuario ya existe';
            break;
          case 500:
            userMessage = 'Error interno del servidor';
            break;
          default:
            userMessage = `Error del servidor: ${error.status}`;
        }
      }
      
      console.error('📢 Mensaje para el usuario:', userMessage);
      
      // Crear un error con el mensaje para el usuario
      const clientError = new Error(userMessage);
      (clientError as any).originalError = error;
      
      return throwError(() => clientError);
    };
  }
}