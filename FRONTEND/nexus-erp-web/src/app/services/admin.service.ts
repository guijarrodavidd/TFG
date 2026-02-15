import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/admin';

  getEmpresas(adminId: number) {
    return this.http.get(`${this.apiUrl}/empresas/${adminId}`);
  }

  guardarEmpresa(data: any) {
    return this.http.post(`${this.apiUrl}/guardar-empresa`, data);
  }

  borrarEmpresa(idEmpresa: number, adminId: number) {
    return this.http.delete(`${this.apiUrl}/borrar-empresa/${idEmpresa}/${adminId}`);
  }

  crearUsuario(data: any) {
    return this.http.post(`${this.apiUrl}/crear-usuario`, data);
  }

  borrarUsuario(idUsuario: number, adminId: number) {
    return this.http.delete(`${this.apiUrl}/borrar-usuario/${idUsuario}/${adminId}`);
  }
}