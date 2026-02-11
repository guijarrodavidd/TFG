import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ==========================================
  // SERVICIOS DE CATEGORÍAS
  // ==========================================

  // Obtener todas las categorías de una empresa
  getCategorias(empresaId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorias/empresa/${empresaId}`);
  }

  // ✅ NUEVA: Crear una categoría
  // Generalmente las categorías se envían como JSON simple, no FormData
  createCategoria(categoria: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias/crear`, categoria);
  }


  // ==========================================
  // SERVICIOS DE PRODUCTOS
  // ==========================================

  getProductoById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/${id}`);
  }

  // Usamos FormData porque los productos suelen llevar imagen
  createProducto(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos/crear`, data);
  }

  updateProducto(id: string, data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos/actualizar/${id}`, data);
  }
}