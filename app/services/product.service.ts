// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/productos`;
  
  // BehaviorSubject para el producto seleccionado en el popup
  private selectedProductSource = new BehaviorSubject<Product | null>(null);
  selectedProduct$ = this.selectedProductSource.asObservable();

  constructor(private http: HttpClient) { }

  // Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // Obtener productos por categoría
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    const url = `${this.apiUrl}?categoria=${categoryId}`;
    console.log(`Solicitando productos de la categoría ${categoryId} desde: ${url}`);
    
    return this.http.get<Product[]>(url)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // Obtener un producto específico por ID
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // Obtener colores de un producto
  getProductColors(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/colors`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // Buscar productos
  searchProducts(term: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?term=${term}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // Seleccionar un producto para mostrar en el popup
  selectProductForPopup(product: Product): void {
    this.selectedProductSource.next(product);
  }

  // Limpiar el producto seleccionado
  clearSelectedProduct(): void {
    this.selectedProductSource.next(null);
  }

  // Añadir un nuevo producto
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // Actualizar un producto existente
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // Subir imágenes de producto
  uploadProductImages(productId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i], files[i].name);
    }
    
    return this.http.post<any>(`${this.apiUrl}/${productId}/images`, formData)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // Eliminar un producto
  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // Método privado para manejar errores
  private handleError(error: any): Observable<never> {
    console.error('Error en ProductService:', error);
    return throwError(() => error);
  }
}