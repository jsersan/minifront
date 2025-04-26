import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product } from 'src/app/models/product';
import { Category } from 'src/app/models/category';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-manager',
  templateUrl: './product-manager.component.html',
  styleUrls: []
})
export class ProductManagerComponent implements OnInit {
  // Arrays para almacenar datos
  products: Product[] = [];
  categories: Category[] = [];
  
  // Formularios para añadir y editar productos
  newProductForm: FormGroup;
  editProductForm: FormGroup;
  
  // Flags y variables de estado
  showEditForm = false;
  editingProduct: Product | null = null;
  
  // Variables para manejar colores y subida de imágenes
  selectedFiles: File[] = [];
  productColors: { color: string, imagen: string }[] = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    // Inicializar formulario para nuevos productos
    this.newProductForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      carpetaimg: ['', Validators.required]
    });

    // Inicializar formulario para edición de productos
    this.editProductForm = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Cargar productos y categorías al inicializar
    this.loadProducts();
    this.loadCategories();
  }

  // Método para cargar todos los productos
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => this.products = products,
      error: (error) => console.error('Error loading products', error)
    });
  }

  // Método para cargar categorías (solo subcategorías)
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        // Filtrar solo categorías que no son padres (subcategorías)
        this.categories = categories.filter(cat => cat.id !== cat.padre);
      },
      error: (error) => console.error('Error loading categories', error)
    });
  }

  // Método para manejar la selección de archivos
  onFileSelect(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  // Método para añadir un nuevo producto
  addProduct(): void {
    // Validar formulario
    if (this.newProductForm.invalid) {
      Swal.fire({
        title: 'Debes rellenar todos los campos del formulario',
        icon: 'error',
        confirmButtonColor: '#52667a'
      });
      return;
    }
  
    // Obtener datos del formulario
    const newProduct: Product = this.newProductForm.value;
    
    // Llamar al servicio para crear producto
    this.productService.addProduct(newProduct).subscribe({
      next: (createdProduct) => {
        // Si hay archivos seleccionados, subirlos ahora
        if (this.selectedFiles.length > 0) {
          this.productService.uploadProductImages(createdProduct.id, this.selectedFiles).subscribe({
            next: (result) => {
              // Mostrar mensaje de éxito y resetear formulario
              Swal.fire({
                title: 'El producto y sus imágenes se han añadido con éxito',
                icon: 'success',
                confirmButtonColor: '#52667a'
              });
              this.newProductForm.reset();
              this.selectedFiles = []; // Limpiar los archivos seleccionados
              this.loadProducts();
            },
            error: (error) => {
              console.error('Error uploading images', error);
              // Producto creado pero hubo un error con las imágenes
              Swal.fire({
                title: 'El producto se ha creado pero hubo un problema al subir las imágenes',
                icon: 'warning',
                confirmButtonColor: '#52667a'
              });
              this.newProductForm.reset();
              this.loadProducts();
            }
          });
        } else {
          // No hay imágenes para subir, solo mostrar mensaje de éxito
          Swal.fire({
            title: 'El producto se ha añadido con éxito',
            icon: 'success',
            confirmButtonColor: '#52667a'
          });
          this.newProductForm.reset();
          this.loadProducts();
        }
      },
      error: (error) => {
        // Mostrar mensaje de error
        Swal.fire({
          title: 'Error al añadir el producto',
          icon: 'error',
          confirmButtonColor: '#52667a'
        });
      }
    });
  }

  // Método para preparar la edición de un producto
  editProduct(product: Product): void {
    this.editingProduct = product;
    this.editProductForm.setValue({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      categoria: product.categoria_id
    });
    this.showEditForm = true;
  }

  // Método para actualizar un producto
// Por esta versión corregida:
updateProduct(): void {
  if (this.editProductForm.valid) {
    const updatedProduct = this.editProductForm.value;
    const productId = updatedProduct.id;
    
    if (!productId) {
      console.error('Error: No se puede actualizar un producto sin ID');
      return;
    }
    
    this.productService.updateProduct(productId, updatedProduct).subscribe({
      next: (result) => {
        console.log('Producto actualizado correctamente:', result);
        
        // Actualizar el producto en la lista local
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index] = result;
        }
        
        this.closeEditModal();
        this.resetEditForm();
      },
      error: (error) => {
        console.error('Error al actualizar el producto:', error);
      }
    });
  } else {
    // Marcar campos como tocados para mostrar errores de validación
    Object.keys(this.editProductForm.controls).forEach(key => {
      this.editProductForm.get(key)?.markAsTouched();
    });
  }
}
  closeEditModal() {
    throw new Error('Method not implemented.');
  }
  resetEditForm() {
    throw new Error('Method not implemented.');
  }

  // Método para eliminar un producto
  deleteProduct(id: number): void {
    // Pedir confirmación al usuario
    Swal.fire({
      title: '¿Estás seguro de eliminar este producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#52667a',
      cancelButtonColor: '#52667a',
      confirmButtonText: 'Borrar el producto',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        // Usuario confirmó, proceder con eliminación
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'El producto se ha eliminado con éxito',
              icon: 'success',
              confirmButtonColor: '#52667a'
            });
            this.loadProducts();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error al eliminar el producto',
              icon: 'error',
              confirmButtonColor: '#52667a'
            });
          }
        });
      }
    });
  }

  // Método para cancelar edición
  cancelEdit(): void {
    this.showEditForm = false;
    this.editingProduct = null;
  }

// Método para obtener el nombre de la categoría
getCategoryName(categoryId: number | undefined): string {
  if (!categoryId) return 'Sin categoría';
  
  const category = this.categories.find(c => c.id === categoryId);
  return category ? category.nombre : 'Categoría desconocida';
}


  // Método para formatear precio como moneda
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
  }
}