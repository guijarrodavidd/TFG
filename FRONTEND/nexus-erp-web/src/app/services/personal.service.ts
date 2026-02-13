import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // 1. Obtener datos del Dashboard (Historial, Turno activo, Resumen)
  getDashboard(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/personal/dashboard/${usuarioId}`);
  }

  // 2. Acción de Fichar (Entrada/Salida)
  fichar(datos: { usuario_id: number; empresa_id: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal/fichar`, datos);
  }

  // 3. Obtener solicitudes de vacaciones
  getSolicitudes(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/personal/solicitudes/${usuarioId}`);
  }

  // 4. Crear nueva solicitud
  solicitarVacaciones(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal/solicitar-vacaciones`, datos);
  }
}