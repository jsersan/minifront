// src/app/app.component.ts - ARCHIVO COMPLETO

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginPopupService } from './services/login-popup.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'tatoodenda';
  
  // ✅ Estado del popup de login
  showLoginPopup = false;
  loginReturnUrl = '/';
  loginFromCheckout = false;
  
  // ✅ Estado del popup de registro
  showRegistroPopup = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private loginPopupService: LoginPopupService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 AppComponent inicializado');
    this.setupLoginPopupSubscriptions();
  }

  ngOnDestroy(): void {
    // ✅ Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ✅ Configurar suscripciones al servicio del popup
  private setupLoginPopupSubscriptions(): void {
    // Suscribirse a cambios de visibilidad
    const visibilitySub = this.loginPopupService.isVisible$.subscribe(isVisible => {
      this.showLoginPopup = isVisible;
      console.log('👁️ Popup visibility changed:', isVisible);
    });

    // Suscribirse a cambios de returnUrl
    const returnUrlSub = this.loginPopupService.returnUrl$.subscribe(returnUrl => {
      this.loginReturnUrl = returnUrl;
      console.log('🎯 Return URL changed:', returnUrl);
    });

    // Suscribirse a cambios de fromCheckout
    const checkoutSub = this.loginPopupService.fromCheckout$.subscribe(fromCheckout => {
      this.loginFromCheckout = fromCheckout;
      console.log('🛒 From checkout changed:', fromCheckout);
    });

    // Suscribirse a eventos de login exitoso
    const loginSuccessSub = this.loginPopupService.loginSuccess$.subscribe(user => {
      this.handleGlobalLoginSuccess(user);
    });

    // Guardar suscripciones para cleanup
    this.subscriptions.push(visibilitySub, returnUrlSub, checkoutSub, loginSuccessSub);
  }

  // ✅ Manejar login exitoso globalmente
  private handleGlobalLoginSuccess(user: any): void {
    console.log('🎉 Login exitoso global:', user.username);
    
    // Aquí puedes añadir lógica global después del login:
    // - Actualizar el estado global
    // - Refrescar datos del usuario
    // - Mostrar notificaciones
    // - etc.
  }

  // ✅ Eventos del popup de login
  onLoginPopupClose(): void {
    console.log('❌ Cerrando popup de login');
    this.loginPopupService.close();
  }

  onLoginSuccess(user: any): void {
    console.log('✅ Login exitoso desde popup:', user.username || user.nombre);
    
    // ✅ IMPORTANTE: Notificar al servicio para que maneje la redirección
    this.loginPopupService.notifyLoginSuccess(user);
    
    // ✅ Cerrar popup
    this.loginPopupService.close();
  }

  onSwitchToRegister(): void {
    console.log('📝 Cambiar de login a registro');
    
    // Mantener el returnUrl actual
    const currentReturnUrl = this.loginReturnUrl;
    const fromCheckout = this.loginFromCheckout;
    
    // Cerrar popup de login
    this.showLoginPopup = false;
    
    // Abrir popup de registro
    this.showRegistroPopup = true;
    
    // Transferir el contexto de checkout si aplica
    if (fromCheckout) {
      console.log('📝 Switch a registro desde checkout con returnUrl:', currentReturnUrl);
    }
  }

  // ✅ Eventos del popup de registro
  onCloseRegistroPopup(): void {
    console.log('❌ Cerrando popup de registro');
    this.showRegistroPopup = false;
    document.body.style.overflow = 'auto';
  }

  onRegistroSuccess(): void {
    console.log('✅ Registro exitoso');
    this.showRegistroPopup = false;
    
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
    
    // ✅ Auto-abrir login para que inicie sesión inmediatamente
    setTimeout(() => {
      this.showLoginPopup = true;
      document.body.style.overflow = 'hidden';
    }, 1000);
  }

  onSwitchToLogin(): void {
    console.log('📝 Cambiar de registro a login');
    
    // Mantener el returnUrl actual
    const currentReturnUrl = this.loginReturnUrl;
    const fromCheckout = this.loginFromCheckout;
    
    // Cerrar popup de registro
    this.showRegistroPopup = false;
    
    // Abrir popup de login
    this.showLoginPopup = true;
    
    // Mantener el contexto
    this.loginReturnUrl = currentReturnUrl;
    this.loginFromCheckout = fromCheckout;
  }

  // ✅ Método de utilidad para abrir popup desde otros componentes
  openLoginPopup(returnUrl: string = '/'): void {
    this.loginPopupService.open(returnUrl);
  }

  // ✅ Método de utilidad para verificar estado de autenticación
  get isLoggedIn(): boolean {
    return !!this.authService.currentUserValue;
  }

  get currentUser(): any {
    return this.authService.currentUserValue;
  }
}