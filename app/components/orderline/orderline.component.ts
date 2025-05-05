import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OrderLine } from 'src/app/models/order';
import { ProductService } from '../../services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orderline',
  templateUrl: './orderline.component.html',
  styleUrls: ['./orderline.component.scss']
})
export class OrderLineComponent implements OnInit {
  // Entrada: la línea de pedido a mostrar
  @Input() line!: OrderLine;

  // Evento para notificar al componente padre cuando se elimina la línea
  @Output() removeLine = new EventEmitter<OrderLine>();

  // Evento para notificar al componente padre cuando se actualiza la cantidad
  @Output() updateQuantity = new EventEmitter<{line: OrderLine, newQuantity: number}>();

  // Propiedad para la imagen del producto
  productImage: string = '';
  
  // Propiedad para el precio del producto
  productPrice: number = 0;

  // Constructor con inyección de servicios
  constructor(
    private productService: ProductService
  ) { }

  // Método para eliminar la línea

  ngOnInit(): void {
    // Si tenemos el id del producto, cargamos su imagen y datos
    if (this.line.idprod) {
      this.loadProductData();
    }
    
    // Log para depuración
    console.log('OrderLine inicializado con:', this.line);
  }

  // Método para cargar los datos del producto (imagen y precio)
  loadProductData(): void {
    this.productService.getProduct(this.line.idprod).subscribe({
      next: (product) => {
        if (product) {
          // Guardamos la imagen
          if (product.imagen) {
            this.productImage = product.imagen;
          } else {
            this.productImage = 'assets/images/products/default.jpg';
          }
          
          // Guardamos el precio
          if (product.precio) {
            this.productPrice = product.precio;
          }
        } else {
          // Imagen por defecto si no existe el producto
          this.productImage = 'assets/images/products/default.jpg';
        }
      },
      error: (error) => {
        console.error('Error loading product data', error);
        // Imagen por defecto en caso de error
        this.productImage = 'assets/images/products/default.jpg';
      }
    });
  }

  removeOrderLine(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el producto de tu pedido',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#52667a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeLine.emit(this.line);
      }
    });
  }

  // Método para incrementar la cantidad
  incrementQuantity(): void {
    const newQuantity = this.line.cantidad + 1;
    this.updateQuantity.emit({line: this.line, newQuantity});
  }

  // Método para decrementar la cantidad
  decrementQuantity(): void {
    if (this.line.cantidad > 1) {
      const newQuantity = this.line.cantidad - 1;
      this.updateQuantity.emit({line: this.line, newQuantity});
    } else {
      // Si intenta reducir a 0, preguntamos si quiere eliminar
      this.removeOrderLine();
    }
  }

  // Método para manejar cambios directos en el campo de cantidad
  onQuantityChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    
    // Validar la cantidad
    if (isNaN(newQuantity) || newQuantity < 1) {
      // Restaurar el valor anterior
      input.value = this.line.cantidad.toString();
      return;
    }
    
    // Emitir el evento de actualización
    this.updateQuantity.emit({line: this.line, newQuantity});
  }
}