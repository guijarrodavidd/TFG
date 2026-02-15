import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Recomendado
import { RRHHService } from '../../services/rrhh.service';

declare var bootstrap: any;

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestion-usuarios.html'
})
export class GestionUsuariosComponent implements OnInit {
  
  rrhhService = inject(RRHHService);
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  empleados: any[] = [];
  empleadoForm: any = { id: null, nombre: '', email: '', password: '' };
  esEdicion = false;
  
  // Guardamos referencia al modal para cerrarlo limpiamente
  private modalInstance: any;

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    if(!this.usuarioLogueado.empresa_id) return;
    
    // Ahora esta función SÍ existe en el servicio actualizado
    this.rrhhService.getUsuarios(this.usuarioLogueado.empresa_id).subscribe({
        next: (res: any) => this.empleados = res,
        error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  abrirModal(empleado: any = null) {
    this.esEdicion = !!empleado;
    
    if (empleado) {
        // Al editar, copiamos los datos y limpiamos la contraseña para no enviarla si no se cambia
        this.empleadoForm = { ...empleado, password: '' };
    } else {
        // Al crear, inicializamos todo
        this.empleadoForm = { 
            id: null, 
            nombre: '', 
            email: '', 
            password: '', 
            empresa_id: this.usuarioLogueado.empresa_id 
        };
    }

    const modalElement = document.getElementById('modalUsuario');
    if (modalElement) {
        this.modalInstance = new bootstrap.Modal(modalElement);
        this.modalInstance.show();
    }
  }

  guardar() {
    const peticion = this.esEdicion 
      ? this.rrhhService.actualizarUsuario(this.empleadoForm.id, this.empleadoForm)
      : this.rrhhService.crearUsuario(this.empleadoForm);

    peticion.subscribe({
        next: () => {
            alert(this.esEdicion ? 'Usuario actualizado' : 'Usuario creado');
            this.cargarEmpleados();
            if (this.modalInstance) this.modalInstance.hide();
        },
        error: (err) => {
            console.error(err);
            alert('Error al guardar: ' + (err.error?.messages?.error || 'Revisa los datos'));
        }
    });
  }

  eliminar(id: number) {
    if(confirm('¿Seguro que deseas eliminar este usuario? Esta acción es irreversible.')) {
      this.rrhhService.eliminarUsuario(id).subscribe({
          next: () => this.cargarEmpleados(),
          error: (err) => alert('Error al eliminar')
      });
    }
  }
}