// src/app/app-routing.module.ts - ARCHIVO COMPLETO

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importar el guard de autenticación
import { AuthGuard } from './guards/auth.guard';

// Importar componentes
import { HomeComponent } from './components/home/home.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { ProductListComponent } from './components/product/product-list/product-list.component';
import { ProductDetailComponent } from './components/product/product-detail/product-detail.component';
import { SearchResultsComponent } from './components/product/search-results/search-results.component';
import { HistorialPedidosComponent } from './components/historial-pedidos/historial-pedidos.component';

const routes: Routes = [
  // ================================
  // 🌐 RUTAS PÚBLICAS (sin autenticación)
  // ================================
  
  // Página principal
  { 
    path: '', 
    component: HomeComponent,
    data: { title: 'Inicio - TatooDenda' }
  },
  
  // Alias para home
  { 
    path: 'home', 
    redirectTo: '', 
    pathMatch: 'full' 
  },
  
  // Productos (públicos - los usuarios pueden ver sin login)
  { 
    path: 'products', 
    component: ProductListComponent,
    data: { title: 'Productos - TatooDenda' }
  },
  
  { 
    path: 'productos', // Alias en español
    redirectTo: 'products',
    pathMatch: 'full'
  },
  
  { 
    path: 'product/:id', 
    component: ProductDetailComponent,
    data: { title: 'Detalle Producto - TatooDenda' }
  },
  
  { 
    path: 'producto/:id', // Alias en español
    redirectTo: 'product/:id'
  },
  
  // Si tienes categorías como rutas
  { 
    path: 'category/:id', 
    component: ProductListComponent,
    data: { title: 'Categoría - TatooDenda' }
  },

  // Ver todo
  { 
    path: 'ver-todo', 
    component: ProductListComponent,
    data: { title: 'Ver Todo - TatooDenda', isViewAll: true }
  },

  // Búsqueda
  { 
    path: 'search', 
    component: SearchResultsComponent,
    data: { title: 'Resultados de Búsqueda - TatooDenda' }
  },

    // Historial de Pedidos

    { 
      path: 'historial', 
      component: HistorialPedidosComponent,
      data: { title: 'Historial de Pedidos - TatooDenda' } 
    },
  

  // ================================
  // 🔒 RUTAS PROTEGIDAS (requieren autenticación)
  // ================================
  
  // Checkout - REQUIERE LOGIN
  { 
    path: 'checkout', 
    component: CheckoutComponent,
    canActivate: [AuthGuard], // 🛡️ Guard de autenticación
    data: { 
      title: 'Checkout - TatooDenda',
      requiresAuth: true 
    }
  },  
  // Perfil de usuario - REQUIERE LOGIN
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard], // 🛡️ Guard de autenticación
    data: { 
      title: 'Mi Perfil - TatooDenda',
      requiresAuth: true 
    }
  },
  
  // Mis pedidos - REQUIERE LOGIN
  { 
    path: 'orders', 
    component: ProfileComponent, // O crear OrderListComponent si lo tienes separado
    canActivate: [AuthGuard], // 🛡️ Guard de autenticación
    data: { 
      title: 'Mis Pedidos - TatooDenda',
      requiresAuth: true 
    }
  },
  
  // Alias en español para pedidos
  { 
    path: 'pedidos', 
    redirectTo: 'orders',
    pathMatch: 'full'
  },

  // ================================
  // 🔄 REDIRECCIONES PARA LOGIN/REGISTRO
  // ================================
  
  // ✅ Redirigir cualquier intento de acceso a login/register → home
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  { path: 'register', redirectTo: '', pathMatch: 'full' },
  { path: 'Login', redirectTo: '', pathMatch: 'full' },
  { path: 'Register', redirectTo: '', pathMatch: 'full' },
  { path: 'Checkout', redirectTo: 'checkout', pathMatch: 'full' },
  { path: 'Profile', redirectTo: 'profile', pathMatch: 'full' },
  
  // ================================
  // 🚫 CATCH-ALL
  // ================================
  
  // Catch-all route - DEBE IR AL FINAL
  { 
    path: '**', 
    redirectTo: '',
    data: { title: 'Página no encontrada - TatooDenda' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Opciones adicionales del router
    enableTracing: false, // Solo para debugging, cambiar a false en producción
    scrollPositionRestoration: 'top', // Scroll al top en cambio de ruta
    anchorScrolling: 'enabled', // Habilitar scroll a anclas
    onSameUrlNavigation: 'reload' // Recargar si se navega a la misma URL
  })],
  exports: [RouterModule],
  providers: [
    // Asegurar que el guard esté disponible
    AuthGuard
  ]
})
export class AppRoutingModule { 

  constructor() {
    console.log('🚀 AppRoutingModule inicializado');
    console.log('🛡️ Rutas protegidas: /checkout, /profile, /orders');
    console.log('🌐 Rutas públicas: /, /products, /product/:id, /category/:id');
    console.log('🔄 Rutas de login/register redirigidas a home');
  }
}