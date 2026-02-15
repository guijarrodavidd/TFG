import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
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

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    if (!this.usuarioLogueado.empresa_id) return;

    this.rrhhService.getEmpleadosResumen(this.usuarioLogueado.empresa_id).subscribe({
      next: (res: any) => {
        // Filtrar para no mostrarse a uno mismo en la lista (opcional)
        this.empleados = res.filter((u: any) => u.id != this.usuarioLogueado.id);
      },
      error: (err) => console.error(err)
    });
  }

  // --- GESTIÓN DE SOLICITUDES ---
  gestionarSolicitud(solicitud: any, accion: 'aprobada' | 'rechazada') {
    if(!confirm(`¿Estás seguro de querer marcar como ${accion.toUpperCase()} esta solicitud?`)) return;

    this.rrhhService.responderSolicitud(solicitud.id, accion).subscribe({
      next: () => {
        alert('Solicitud actualizada correctamente');
        this.cargarDatos(); // Recargar para ver los días restados
      },
      error: (err) => alert('Error: ' + (err.error?.messages?.error || 'No se pudo procesar'))
    });
  }

  // --- ACTUALIZAR DÍAS DISPONIBLES ---
  guardarDias(empleado: any) {
    this.rrhhService.actualizarDias(empleado.id, empleado.dias_disponibles).subscribe({
        next: () => alert('Días actualizados correctamente'),
        error: () => alert('Error al actualizar días')
    });
  }

  // --- SUBIR NÓMINA ---
  onFileSelected(event: any, userId: number, mes: string) {
    if(!mes) { alert('Selecciona el mes primero'); return; }
    
    const file = event.target.files[0];
    if(file) {
        const formData = new FormData();
        formData.append('nomina', file);
        formData.append('usuario_id', userId.toString());
        formData.append('mes', mes);

        this.rrhhService.subirNomina(formData).subscribe({
            next: () => alert('Nómina subida correctamente'),
            error: () => alert('Error al subir archivo')
        });
    }
  }

  // Helper para calcular días visualmente
  calcularDias(inicio: string, fin: string): number {
      const d1 = new Date(inicio);
      const d2 = new Date(fin);
      const diff = d2.getTime() - d1.getTime();
      return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
  }
}