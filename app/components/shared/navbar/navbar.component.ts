import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { CategoryService } from '../../../services/category.service'
import { AuthService } from '../../../services/auth.service'
import { CartService } from '../../../services/cart.service'
import { Category } from '../../../models/category'
import { User } from '../../../models/user'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  // Propiedades del componente
  categories: Category[] = []
  currentUser: User | null = null
  searchTerm: string = ''

  constructor (
    private categoryService: CategoryService,
    private authService: AuthService,
    public cartService: CartService,
    public router: Router
  ) {}

  ngOnInit (): void {
    // Cargar categorías
    this.loadCategories()

    // Suscribirse a cambios en el usuario actual
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user
    })

    // Asegurarse de que el carrito esté cerrado al inicio
    setTimeout(() => {
      if (this.cartService.isCartOpen) {
        this.cartService.closeCart()
      }

      // También podemos cerrar el carrito manualmente si es necesario
      const cartPopup = document.querySelector('.cart-popup') as HTMLElement
      const cartOverlay = document.querySelector('.cart-overlay') as HTMLElement

      if (cartPopup) cartPopup.classList.remove('active')
      if (cartOverlay) cartOverlay.classList.remove('active')

      document.body.style.overflow = 'auto'
    }, 1)
  }

  // Método para obtener el ID de una subcategoría por su nombre
  getSubcategoryId(name: string): number {
    // Normalizar el nombre para la búsqueda (quitar acentos, convertir a mayúsculas)
    const normalizedSearchName = name.toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    // Buscar la categoría con normalización también
    const category = this.categories.find(cat => {
      const normalizedCatName = cat.nombre.toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return normalizedCatName === normalizedSearchName;
    });
    
    // Depuración para identificar el problema
    console.log(`Buscando categoría: "${name}" (normalizado: "${normalizedSearchName}")`);
    if (category) {
      console.log(`Categoría encontrada: ${category.nombre} (ID: ${category.id})`);
    } else {
      console.log('Categoría no encontrada. Categorías disponibles:', 
        this.categories.map(c => `${c.nombre} (ID: ${c.id})`));
    }
    
    return category ? category.id : 0;
  }

  // Método corregido para el navbar.component.ts
  // En navbar.component.ts
  toggleCartAndLog (): void {
    console.log('Cart icon clicked')
    // Alternativa a this.cartService.toggleCart()
    if (this.cartService.isCartOpen) {
      this.cartService.closeCart()
    } else {
      // Intenta acceder al método openCart
      if (typeof this.cartService['openCart'] === 'function') {
        ;(this.cartService as any).openCart()
      } else {
        console.warn(
          'El método openCart no está disponible, usando alternativa'
        )
        // Activa las clases directamente
        const cartPopup = document.querySelector('.cart-popup') as HTMLElement
        const cartOverlay = document.querySelector(
          '.cart-overlay'
        ) as HTMLElement

        if (cartPopup) cartPopup.classList.add('active')
        if (cartOverlay) cartOverlay.classList.add('active')

        // Y actualiza el estado si es posible
        if (this.cartService['_isCartOpen']) {
          this.cartService['_isCartOpen'].next(true)
        }

        document.body.style.overflow = 'hidden'
      }
    }
    console.log('After toggle, cart is open:', !this.cartService.isCartOpen)
  }

  // Método para cargar las categorías desde el servicio
  loadCategories (): void {
    this.categoryService.getCategories().subscribe({
      next: categories => {
        console.log('Categorías cargadas:', categories)
        this.categories = categories
      },
      error: error => console.error('Error loading categories', error)
    })
  }

  // Método para obtener la categoría DILATACIONES
  getDilatacionesCategory (): Category | undefined {
    return this.categories.find(
      category => category.nombre.toUpperCase() === 'DILATACIONES'
    )
  }

  // Método para obtener la categoría PIERCINGS
  getPiercingsCategory (): Category | undefined {
    return this.categories.find(
      category => category.nombre.toUpperCase() === 'PIERCINGS'
    )
  }

  // Método para obtener las subcategorías de DILATACIONES
  // Método para obtener las subcategorías de DILATACIONES
  getSubcategoriesForDilataciones (): Category[] {
    const dilataciones = this.getDilatacionesCategory()
    if (!dilataciones) return []

    // Filtrar categorías que tienen como padre la categoría DILATACIONES
    // Y EXCLUIR cualquier subcategoría que se llame igual que la categoría padre
    const subcategories = this.categories.filter(
      category =>
        category.padre === dilataciones.id &&
        category.nombre.toUpperCase() !== 'DILATACIONES'
    )

    console.log('Subcategorías de DILATACIONES:', subcategories)
    return subcategories
  }

  // Método para filtrar las subcategorías de DILATACIONES y evitar duplicados
  getFilteredSubcategoriesForDilataciones (): Category[] {
    const dilataciones = this.getDilatacionesCategory()
    if (!dilataciones) return []

    // Nombres de las subcategorías que ya tenemos listadas explícitamente
    const excludedNames = ['EXPANDERS', 'PLUGS', 'TUNELES','TÚNELES']

    // Filtrar para obtener solo las subcategorías que no están explícitamente listadas
    return this.categories.filter(
      category =>
        category.padre === dilataciones.id &&
        !excludedNames.includes(category.nombre.toUpperCase())
    )
  }

  // Método para filtrar las subcategorías de PIERCINGS y evitar duplicados
// Método para filtrar las subcategorías de PIERCINGS y evitar duplicados
getFilteredSubcategoriesForPiercings(): Category[] {
  const piercings = this.getPiercingsCategory();
  if (!piercings) return [];
  
  // Nombres de las subcategorías que ya tenemos listadas explícitamente
  const excludedNames = ['ANILLOS', 'BANANAS', 'BARBELLS', 'CIRCULAR BARBELLS', 'LABRETS'];
  
  // Filtrar para obtener solo las subcategorías que no están explícitamente listadas
  return this.categories.filter(category => 
    category.padre === piercings.id && 
    !excludedNames.includes(category.nombre.toUpperCase())
  );
}

  

  // Método para navegar a una categoría
  navigateToCategory (categoryId: number): void {
    console.log(`Navegando a categoría ID: ${categoryId}`)
    this.router.navigate(['/category', categoryId])
  }

  // Método para verificar si el usuario actual es administrador
  isAdmin (): boolean {
    return this.currentUser?.role === 'admin'
  }

  // Método para cerrar sesión
  logout (): void {
    this.authService.logout()
    this.router.navigate(['/'])
  }

  // Método para realizar la búsqueda
  search (): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { term: this.searchTerm }
      })
      this.searchTerm = '' // Limpiar después de buscar
    }
  }
}
