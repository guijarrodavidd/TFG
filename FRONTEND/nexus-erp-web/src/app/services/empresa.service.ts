import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  crearEmpresa(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/empresas/crear`, datos);
  }
}