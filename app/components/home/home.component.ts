// Importamos los decoradores y clases necesarias desde Angular
import { Component, OnInit } from '@angular/core';
// Importamos el modelo de datos para los productos
import { Product } from '../../models/product';
// Importamos el servicio que se encargará de obtener los productos de la API
import { ProductService } from '../../services/product.service';

// Decorador @Component que define las propiedades del componente Angular
@Component({
  // El selector CSS que se usará para insertar este componente en otras plantillas
  selector: 'app-home',
  // La ruta a la plantilla HTML que define la estructura visual de este componente
  templateUrl: './home.component.html'
  // styleUrls eliminado ya que los estilos se han fusionado en el archivo global
})
// La clase del componente que implementa OnInit (interfaz del ciclo de vida)
export class HomeComponent implements OnInit {
  // Propiedades de clase:
  
  // Array para almacenar todos los productos
  products: Product[] = [];
  
  // Array para almacenar los 8 productos aleatorios que se mostrarán
  randomProducts: Product[] = [];

  // Constructor del componente donde inyectamos las dependencias
  // productService se inyecta automáticamente gracias al sistema de DI de Angular
  constructor(private productService: ProductService) { }

  // Método de ciclo de vida que se ejecuta cuando Angular ha terminado de inicializar el componente
  ngOnInit(): void {
    // Cargamos la lista de productos
    this.loadProducts();
  }

  // Método para cargar productos desde el servicio y seleccionar 8 aleatorios
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        console.log('Productos cargados:', products);
        // Seleccionar 8 productos aleatorios
        this.selectRandomProducts();
      },
      error: (error) => console.error('Error loading products', error)
    });
  }

  // Método para seleccionar 8 productos aleatorios
  selectRandomProducts(): void {
    // Crear una copia del array original para no modificarlo
    const productsCopy = [...this.products];
    this.randomProducts = [];
    
    // Determinar cuántos productos seleccionar (8 o menos si no hay suficientes)
    const numToSelect = Math.min(8, productsCopy.length);
    
    // Seleccionar productos aleatorios
    for (let i = 0; i < numToSelect; i++) {
      // Generar un índice aleatorio
      const randomIndex = Math.floor(Math.random() * productsCopy.length);
      // Añadir el producto al array de aleatorios
      this.randomProducts.push(productsCopy[randomIndex]);
      // Eliminar el producto seleccionado para no repetirlo
      productsCopy.splice(randomIndex, 1);
    }
  }

  // Método para abrir el popup del producto
  openProductPopup(product: Product): void {
    // Llamar al servicio para seleccionar el producto
    this.productService.selectProductForPopup(product);
  }
}