// Importaciones desde Angular Core
import { Component, OnInit } from '@angular/core';
// Importación para acceder a los parámetros de la ruta
import { ActivatedRoute } from '@angular/router';
// Importación de los servicios que se usarán
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
// Importación de los modelos de datos
import { Product } from 'src/app/models/product';

// Importación de SweetAlert para notificaciones
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: []
})
export class ProductDetailComponent implements OnInit {
  // Propiedad para almacenar los datos del producto actual
  product: Product | null = null;
  
  // Propiedad para almacenar los colores disponibles del producto
  colors: any[] = [];
  
  // Propiedad para almacenar el color seleccionado por el usuario
  selectedColor: string = '';
  
  // Propiedad para almacenar la cantidad seleccionada por el usuario
  quantity: number = 1;
  
  // Constructor con inyección de dependencias
  constructor(
    private route: ActivatedRoute,         // Para acceder a los parámetros de la URL
    private productService: ProductService, // Para obtener los datos del producto
    private cartService: CartService        // Para añadir productos al carrito
  ) { }

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    // Suscripción a los cambios en los parámetros de la ruta
    this.route.params.subscribe({
      next: (params) => {
        // Extraer el ID del producto de los parámetros
        const productId = +params['id'];  // El + convierte el string a número
        // Cargar los datos del producto con ese ID
        this.loadProduct(productId);
      }
    });
  }

  // Método para cargar los datos de un producto específico
  loadProduct(id: number): void {
    // Llamar al servicio para obtener los detalles del producto
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        // Almacenar el producto obtenido
        this.product = product;
        // Cargar los colores disponibles para este producto
        this.loadProductColors(id);
      },
      error: (error) => console.error('Error loading product', error)
    });
  }

  // Método para cargar los colores disponibles para un producto
  loadProductColors(productId: number): void {
    // Llamar al servicio para obtener los colores
    this.productService.getProductColors(productId).subscribe({
      next: (colors) => this.colors = colors,
      error: (error) => console.error('Error loading product colors', error)
    });
  }

  // Método para cambiar el color seleccionado y actualizar la imagen mostrada
  changeColor(color: string, imagePath: string): void {
    // Actualizar el color seleccionado
    this.selectedColor = color;
    
    // Actualizar la imagen del producto en la UI para mostrar el color seleccionado
    const imgElement = document.getElementById('imgart') as HTMLImageElement;
    if (imgElement) {
      imgElement.src = imagePath;
    }
  }

  // Método para incrementar la cantidad
  incrementQuantity(): void {
    this.quantity++;
  }

  // Método para decrementar la cantidad (mínimo 1)
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Método para añadir el producto al carrito
  addToCart(): void {
    if (!this.product) return;
    this.cartService.addToCart(
      this.product,
      this.quantity,
      this.selectedColor
    );
    
    // Mostrar confirmación al usuario
    Swal.fire({
      title: 'Producto añadido al carrito',
      icon: 'success',
      confirmButtonColor: '#52667a'
    });
  }

  // Método auxiliar para obtener la imagen correspondiente al color seleccionado
  getColorImage(): string {
    // Buscar la información del color seleccionado
    const colorInfo = this.colors.find(c => c.color === this.selectedColor);
    // Devolver el nombre de la imagen o cadena vacía si no se encuentra
    return colorInfo ? colorInfo.imagen : '';
  }
}