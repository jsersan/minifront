// src/app/components/admin/category-manager/category-manager.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-manager',
  templateUrl: './category-manager.component.html',
  styleUrls: []
})
export class CategoryManagerComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  editMode: boolean = false;
  selectedCategoryId: number | null = null;
error: any;
loading: any;
success: any;
  
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }
  
  // Cargar categorías desde el servicio
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        alert('Error al cargar las categorías. Por favor, intente nuevamente.');
      }
    });
  }
  
  // Crear formulario para categoría
  createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      padre: [0], // 0 para categorías principales
      descripcion: [''],
      tipo: ['']
    });
  }
  
  // Método para manejar el envío del formulario
  onSubmit(): void {
    if (this.categoryForm.valid) {
      if (this.editMode && this.selectedCategoryId) {
        // Actualizar categoría existente
        this.updateCategory();
      } else {
        // Crear nueva categoría
        this.createCategory();
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
    }
  }
  
  // Método para crear una nueva categoría
  createCategory(): void {
    const categoryData: Category = {
      id: 0, // El backend asignará un ID real
      nombre: this.categoryForm.value.nombre,
      padre: this.categoryForm.value.padre || 0,
      descripcion: this.categoryForm.value.descripcion || '',
      tipo: this.categoryForm.value.tipo || ''
    };
    
    // En tu método de clase
  this.categoryService.addCategory(categoryData).subscribe({
  next: (createdCategory: Category) => {
    // Tu código actual aquí
  },
  error: (error: any) => {
    // Tu código actual aquí
  }
});
  }
  
  // Método para editar una categoría
  editCategory(category: Category): void {
    this.editMode = true;
    this.selectedCategoryId = category.id;
    
    this.categoryForm.setValue({
      nombre: category.nombre,
      padre: category.padre || 0,
      descripcion: category.descripcion || '',
      tipo: category.tipo || ''
    });
  }
  
  // Método para actualizar una categoría existente
  updateCategory(): void {
    if (!this.selectedCategoryId) return;
    
    const categoryData: Partial<Category> = {
      nombre: this.categoryForm.value.nombre,
      padre: this.categoryForm.value.padre,
      descripcion: this.categoryForm.value.descripcion,
      tipo: this.categoryForm.value.tipo
    };
    
    // Validación para evitar ciclos (categoría que es padre de sí misma)
    if (this.selectedCategoryId === categoryData.padre) {
      alert('Error: Una categoría no puede ser padre de sí misma.');
      return;
    }
    
    this.categoryService.updateCategory(this.selectedCategoryId, categoryData).subscribe({
      next: (updatedCategory) => {
        console.log('Categoría actualizada:', updatedCategory);
        
        // Actualizar la categoría en el array local
        const index = this.categories.findIndex(c => c.id === this.selectedCategoryId);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        
        this.resetForm();
        alert('Categoría actualizada con éxito.');
      },
      error: (error) => {
        console.error('Error al actualizar categoría:', error);
        alert('Error al actualizar la categoría. Por favor, intente nuevamente.');
      }
    });
  }
  
  // Método para eliminar una categoría
  deleteCategory(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta categoría? Esta acción no se puede deshacer.')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          console.log('Categoría eliminada:', id);
          this.categories = this.categories.filter(c => c.id !== id);
          alert('Categoría eliminada con éxito.');
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
          alert('Error al eliminar la categoría. Por favor, intente nuevamente.');
        }
      });
    }
  }
  
  // Método para cancelar la edición
  cancelEdit(): void {
    this.resetForm();
  }
  
  // Método para resetear el formulario
  resetForm(): void {
    this.categoryForm.reset({
      nombre: '',
      padre: 0,
      descripcion: '',
      tipo: ''
    });
    this.editMode = false;
    this.selectedCategoryId = null;
  }
  
  // Método para obtener el nombre de la categoría padre
  getParentName(parentId: number | undefined): string {
    if (!parentId || parentId === 0) return 'Ninguno (Categoría principal)';
    
    const parent = this.categories.find(c => c.id === parentId);
    return parent ? parent.nombre : 'Desconocido';
  }
}