import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Registrar una nueva venta
  crearVenta(datosVenta: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ventas/crear`, datosVenta);
  }

  // (Opcional) Obtener historial de ventas
  getHistorialVentas(empresaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventas/empresa/${empresaId}`);
  }
}