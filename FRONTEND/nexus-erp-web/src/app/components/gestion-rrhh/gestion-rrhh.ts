import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RRHHService } from '../../services/rrhh.service';

@Component({
  selector: 'app-gestion-rrhh',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-rrhh.html'
})
export class GestionRRHHComponent implements OnInit {
  
  rrhhService = inject(RRHHService);
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  empleados: any[] = [];

  // TOASTS VARIABLES
  toastVisible: boolean = false;
  toastMensaje: string = '';
  toastTipo: 'warning' | 'error' | 'success' = 'warning';

  ngOnInit() {
    this.cargarDatos();
  }

  mostrarToast(mensaje: string, tipo: 'warning' | 'error' | 'success') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  cargarDatos() {
  const empresaId = this.usuarioLogueado.empresa_id;
  const adminId = this.usuarioLogueado.id;

  if (empresaId && adminId) {
    this.rrhhService.getEmpleadosResumen(empresaId, adminId).subscribe({
      next: (res: any) => {
        this.empleados = res.filter((u: any) => u.id != adminId);
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarToast('No se han podido cargar los empleados', 'error');
      }
    });
  }
}
  // PARA SOLICITAR VACACIONES + TOAST DE VALIDACIÓN O ERROR
  gestionarSolicitud(solicitud: any, accion: 'aprobada' | 'rechazada') {
    this.rrhhService.responderSolicitud(solicitud.id, accion).subscribe({
      next: () => {
        this.mostrarToast(`Solicitud ${accion} correctamente`, 'success');
        this.cargarDatos(); 
      },
      error: (err) => {
        const errorMsg = err.error?.messages?.error || 'No se pudo procesar la solicitud';
        this.mostrarToast(errorMsg, 'error');
      }
    });
  }

  // MODIFICAR VACACIONES
  guardarDias(empleado: any) {
    this.rrhhService.actualizarDias(empleado.id, empleado.dias_disponibles).subscribe({
        next: () => this.mostrarToast('Días actualizados con éxito', 'success'),
        error: () => this.mostrarToast('Error al actualizar los días', 'error')
    });
  }

  // SUBIR NOMINA + MANEJO DE ERRORES SI NO SE SUBE
  onFileSelected(event: any, userId: number, mes: string) {
    if(!mes) { 
      this.mostrarToast('Selecciona el mes de la nómina primero', 'warning'); 
      return; 
    }
    
    const file = event.target.files[0];
    if(file) {
        if (file.type !== 'application/pdf') {
            this.mostrarToast('Solo se admiten archivos PDF', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('nomina', file);
        formData.append('usuario_id', userId.toString());
        formData.append('mes', mes);

        this.rrhhService.subirNomina(formData).subscribe({
            next: () => {
                this.mostrarToast('Nómina subida y asignada correctamente', 'success');
                event.target.value = '';
            },
            error: () => this.mostrarToast('Error crítico al subir el archivo', 'error')
        });
    }
  }

  calcularDias(inicio: string, fin: string): number {
      const d1 = new Date(inicio);
      const d2 = new Date(fin);
      const diff = d2.getTime() - d1.getTime();
      return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
  }
}