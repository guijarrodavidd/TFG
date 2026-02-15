import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RRHHService } from '../../services/rrhh.service';

declare var bootstrap: any;

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.html'
})
export class GestionUsuariosComponent implements OnInit {
  rrhhService = inject(RRHHService);
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  empleados: any[] = [];
  empleadoForm: any = { id: null, nombre: '', email: '', password: '' };
  esEdicion = false;

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    if(!this.usuarioLogueado.empresa_id) return;
    this.rrhhService.getUsuarios(this.usuarioLogueado.empresa_id).subscribe((res: any) => {
      this.empleados = res;
    });
  }

  abrirModal(empleado: any = null) {
    this.esEdicion = !!empleado;
    this.empleadoForm = empleado ? { ...empleado, password: '' } : { id: null, nombre: '', email: '', password: '', empresa_id: this.usuarioLogueado.empresa_id };
    new bootstrap.Modal(document.getElementById('modalUsuario')).show();
  }

  guardar() {
    const peticion = this.esEdicion 
      ? this.rrhhService.actualizarUsuario(this.empleadoForm.id, this.empleadoForm)
      : this.rrhhService.crearUsuario(this.empleadoForm);

    peticion.subscribe(() => {
      alert('Guardado correctamente');
      this.cargarEmpleados();
      // Cerrar modal (simplificado)
      document.getElementById('btnCerrarModal')?.click(); 
    });
  }

  eliminar(id: number) {
    if(confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.rrhhService.eliminarUsuario(id).subscribe(() => this.cargarEmpleados());
    }
  }
}