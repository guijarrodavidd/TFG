import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RRHHService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
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
  
  getEmpleadosResumen(empresaId: number, adminId: number) {
  return this.http.get(`${this.apiUrl}/rrhh/empleados/${empresaId}?admin_id=${adminId}`);
}

  responderSolicitud(solicitudId: number, accion: 'aprobada' | 'rechazada') {
    return this.http.post(`${this.apiUrl}/rrhh/gestionar-ausencia`, { solicitud_id: solicitudId, accion });
  }

  actualizarDias(usuarioId: number, dias: number) {
    return this.http.post(`${this.apiUrl}/rrhh/actualizar-dias`, { usuario_id: usuarioId, dias });
  }

  subirNomina(formData: FormData) {
    return this.http.post(`${this.apiUrl}/rrhh/subir-nomina`, formData);
  }
}