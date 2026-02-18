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

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credenciales);
  }

  registrarEncargado(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro-encargado`, datos);
  }

  registrarEmpleado(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro-empleado`, datos);
  }
}