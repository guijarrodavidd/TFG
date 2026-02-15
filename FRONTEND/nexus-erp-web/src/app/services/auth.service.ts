import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; 

  // --- LOGIN ---
  login(credenciales: any): Observable<any> {
    // ✅ CORRECCIÓN ARQUITECTÓNICA: 
    // Añadimos '/auth' para coincidir con el grupo de rutas del Backend.
    return this.http.post(`${this.apiUrl}/auth/login`, credenciales);
  }

  // Registro de Encargado (Jefe)
  registrarEncargado(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro-encargado`, datos);
  }

  // Registro de Empleado (Invitación)
  registrarEmpleado(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro-empleado`, datos);
  }
}