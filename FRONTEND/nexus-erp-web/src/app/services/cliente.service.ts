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

  // Obtener clientes por empresa
  getClientesPorEmpresa(empresaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/empresa/${empresaId}`);
  }

  // Obtener detalle de un cliente
  getDetalleCliente(clienteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/detalle/${clienteId}`);
  }

  // Crear cliente
  crearCliente(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes/crear`, datos);
  }
}