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

  crearVenta(datosVenta: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ventas/crear`, datosVenta);
  }

  getHistorialVentas(empresaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventas/empresa/${empresaId}`);
  }
}