import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RRHHService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // USUARIOS
  getUsuarios(empresaId: number) {
    return this.http.get(`${this.apiUrl}/usuarios/empresa/${empresaId}`);
  }
  crearUsuario(data: any) {
    return this.http.post(`${this.apiUrl}/usuarios/crear`, data);
  }
  actualizarUsuario(id: number, data: any) {
    return this.http.post(`${this.apiUrl}/usuarios/actualizar/${id}`, data);
  }
  eliminarUsuario(id: number) {
    return this.http.delete(`${this.apiUrl}/usuarios/eliminar/${id}`);
  }

  // RRHH
  subirNomina(formData: FormData) {
    return this.http.post(`${this.apiUrl}/rrhh/subir-nomina`, formData);
  }
}