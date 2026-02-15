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

  // --- PRODUCTOS ---

  // ✅ NUEVO: Obtener lista de productos por empresa
  getProductosPorEmpresa(empresaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/empresa/${empresaId}`);
  }

  getProductoById(id: string) {
    return this.http.get(`${this.apiUrl}/productos/ver/${id}`);
  }

  createProducto(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos/crear`, data);
  }

  updateProducto(id: string, data: FormData) {
    return this.http.post(`${this.apiUrl}/productos/actualizar/${id}`, data);
  }

  borrarProducto(id: string) {
    return this.http.delete(`${this.apiUrl}/productos/borrar/${id}`);
  }

  // --- CATEGORÍAS ---

  getCategorias(empresaId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorias/empresa/${empresaId}`);
  }

  createCategoria(categoria: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias/crear`, categoria);
  }
}