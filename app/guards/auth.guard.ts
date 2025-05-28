// src/app/guards/auth.guard.ts - ARCHIVO COMPLETO

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginPopupService } from './../services/login-popup.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private loginPopupService: LoginPopupService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('🛡️ AuthGuard verificando acceso a:', state.url);
    
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      console.log('✅ Usuario autenticado:', currentUser.username);
      return true;
    }

    console.log('❌ Usuario no autenticado, abriendo popup de login');
    
    // ✅ SOLO abrir popup, NO navegar
    this.loginPopupService.openForCheckout(state.url);
    
    // ✅ Simplemente retornar false para bloquear la navegación
    return false;
  }
}