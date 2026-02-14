import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Listar
  getClientesPorEmpresa(empresaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/empresa/${empresaId}`);
  }

  // Crear
  crearCliente(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes/crear`, datos);
  }

  // ✅ NUEVO: Actualizar Cliente
  actualizarCliente(id: number, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes/actualizar/${id}`, datos);
  }
}