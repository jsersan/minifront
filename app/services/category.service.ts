import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // Corregido: Usando la ruta correcta
  private apiUrl = `${environment.apiUrl}/categorias`;
  
  // Cache para almacenar categorías
  private categoriesCache: Category[] | null = null;
  private categoryCache: { [key: number]: Category } = {};

  constructor(private http: HttpClient) { }

  // Obtener todas las categorías
  getCategories(): Observable<Category[]> {
    // Si ya tenemos las categorías en caché, las devolvemos directamente
    if (this.categoriesCache) {
      console.log('Devolviendo categorías desde caché');
      return of(this.categoriesCache);
    }
    
    console.log('Solicitando categorías desde:', this.apiUrl);
    return this.http.get<Category[]>(this.apiUrl).pipe(
      tap(categories => {
        console.log('Categorías obtenidas del servidor:', categories);
        // Guardar en caché para futuras solicitudes
        this.categoriesCache = categories;
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Obtener una categoría específica por ID
  getCategory(id: number): Observable<Category> {
    // Si ya tenemos esta categoría en caché, la devolvemos directamente
    if (this.categoryCache[id]) {
      console.log(`Devolviendo categoría ${id} desde caché`);
      return of(this.categoryCache[id]);
    }
    
    // Si tenemos todas las categorías en caché, buscamos la que necesitamos
    if (this.categoriesCache) {
      const category = this.categoriesCache.find(c => c.id === id);
      if (category) {
        console.log(`Categoría ${id} encontrada en el caché general`);
        this.categoryCache[id] = category; // Guardar en caché individual
        return of(category);
      }
    }
    
    // Si no está en caché, la solicitamos al servidor
    console.log(`Solicitando categoría ${id} desde: ${this.apiUrl}/${id}`);
    return this.http.get<Category>(`${this.apiUrl}/${id}`).pipe(
      tap(category => {
        console.log(`Categoría ${id} obtenida del servidor:`, category);
        // Guardar en caché para futuras solicitudes
        this.categoryCache[id] = category;
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Obtener subcategorías de una categoría específica
  getSubcategories(parentId: number): Observable<Category[]> {
    // Si ya tenemos todas las categorías en caché, filtramos las subcategorías
    if (this.categoriesCache) {
      const subcategories = this.categoriesCache.filter(c => c.padre === parentId);
      console.log(`Subcategorías de ${parentId} obtenidas de caché:`, subcategories);
      return of(subcategories);
    }
    
    // Si no tenemos el caché, obtenemos todas las categorías y luego filtramos
    return this.getCategories().pipe(
      map(categories => {
        const subcategories = categories.filter(c => c.padre === parentId);
        console.log(`Subcategorías de ${parentId}:`, subcategories);
        return subcategories;
      })
    );
  }

  // Añadir una nueva categoría
  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category).pipe(
      tap(newCategory => {
        console.log('Nueva categoría añadida:', newCategory);
        // Invalidar caché para que se recarguen los datos
        this.clearCache();
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Actualizar una categoría existente
  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category).pipe(
      tap(updatedCategory => {
        console.log(`Categoría ${id} actualizada:`, updatedCategory);
        // Invalidar caché para que se recarguen los datos
        this.clearCache();
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Eliminar una categoría
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log(`Categoría ${id} eliminada`);
        // Invalidar caché para que se recarguen los datos
        this.clearCache();
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Limpiar caché
  clearCache(): void {
    this.categoriesCache = null;
    this.categoryCache = {};
    console.log('Caché de categorías limpiado');
  }

  // Método para manejar errores que retorna un Observable
  private handleError(error: any): Observable<never> {
    console.error('Error en CategoryService:', error);
    return throwError(() => error);
  }
}