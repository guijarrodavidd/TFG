import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PersonalService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getDashboard(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/personal/dashboard/${usuarioId}`);
  }

  // ✅ Esta es la función que llama a la parte que acabamos de restaurar
  fichar(datos: { usuario_id: number; empresa_id: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal/fichar`, datos);
  }

  solicitarVacaciones(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal/solicitar-vacaciones`, datos);
  }
}