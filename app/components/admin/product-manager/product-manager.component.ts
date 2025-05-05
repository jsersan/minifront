import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product } from '../../../models/product';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-product-manager',
  templateUrl: './product-manager.component.html',
  styleUrls: []
})
export class ProductManagerComponent implements OnInit {
  // Formularios para productos (nombres actualizados para coincidir con HTML)
  newProductForm: FormGroup; // Cambiado de productForm
  editProductForm: FormGroup; // Cambiado de editForm
  
  // Listados
  products: Product[] = [];
  categories: Category[] = [];
  
  // Control de UI
  loading = false;
  submitting = false;
  showEditForm = false; // Cambiado de editMode
  currentProductId: number | null = null;
  
  // Control de imágenes
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    // Inicializar formularios
    this.newProductForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required]
    });

    this.editProductForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  // Cargar todos los productos
  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.loading = false;
      }
    });
  }

  // Cargar categorías para el selector de formulario
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  // Manejar subida de imágenes (cambiado a onFileSelect para coincidir con HTML)
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.previewUrls = [];
      
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  // Método para añadir un nuevo producto (cambiado a addProduct para coincidir con HTML)
  addProduct(): void {
    if (this.newProductForm.invalid) {
      return;
    }

    this.submitting = true;
    const newProduct: Product = this.newProductForm.value;

    this.productService.addProduct(newProduct).subscribe({
      next: (createdProduct: Product) => {
        console.log('Producto creado:', createdProduct);
        
        // Si hay archivos seleccionados, subir imágenes
        if (this.selectedFiles.length > 0) {
          this.productService.uploadProductImages(createdProduct.id, this.selectedFiles).subscribe({
            next: (result: any) => {
              console.log('Imágenes subidas:', result);
              this.resetForm();
              this.loadProducts();
              this.submitting = false;
            },
            error: (error: any) => {
              console.error('Error al subir imágenes:', error);
              // Aún consideramos que el producto se creó correctamente
              this.resetForm();
              this.loadProducts();
              this.submitting = false;
            }
          });
        } else {
          // Si no hay imágenes, simplemente terminamos
          this.resetForm();
          this.loadProducts();
          this.submitting = false;
        }
      },
      error: (error: any) => {
        console.error('Error al crear producto:', error);
        this.submitting = false;
      }
    });
  }

  // Resetear formulario y selección de archivos
  resetForm(): void {
    this.newProductForm.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoryId: null
    });
    this.selectedFiles = [];
    this.previewUrls = [];
  }

  // Cargar datos en el formulario de edición
  editProduct(product: Product): void {
    this.currentProductId = product.id;
    this.showEditForm = true; // Cambiado de editMode
    this.editProductForm.setValue({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      categoryId: product.categoria_id
    });
  }

  // Actualizar un producto existente (cambiado a updateProduct para coincidir con HTML)
  updateProduct(): void {
    if (this.editProductForm.invalid || !this.currentProductId) {
      return;
    }

    this.submitting = true;
    const productId = this.currentProductId;
    const updatedProduct: Product = this.editProductForm.value;

    this.productService.updateProduct(productId, updatedProduct).subscribe({
      next: (result: Product) => {
        console.log('Producto actualizado:', result);
        this.showEditForm = false; // Cambiado de editMode
        this.currentProductId = null;
        this.loadProducts();
        this.submitting = false;
      },
      error: (error: any) => {
        console.error('Error al actualizar producto:', error);
        this.submitting = false;
      }
    });
  }

  // Cancelar edición
  cancelEdit(): void {
    this.showEditForm = false; // Cambiado de editMode
    this.currentProductId = null;
    this.editProductForm.reset();
  }

  // Eliminar un producto
  deleteProduct(id: number): void {
    if (confirm('¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      this.loading = true;
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          console.log('Producto eliminado correctamente');
          this.loadProducts();
        },
        error: (error: any) => {
          console.error('Error al eliminar producto:', error);
          this.loading = false;
        }
      });
    }
  }

  // Método para formatear precio como moneda (faltaba según HTML)
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Método para obtener el nombre de categoría por ID (faltaba según HTML)
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  }
}