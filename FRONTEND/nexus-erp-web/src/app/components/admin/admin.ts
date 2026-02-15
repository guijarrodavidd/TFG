import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

declare var bootstrap: any; // Para manejar el modal

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html'
})
export class AdminComponent implements OnInit {
  adminService = inject(AdminService);
  adminId: number = 0;

  empresas: any[] = [];
  empresaSeleccionada: any = {};
  
  // Modelos para formularios
  formEmpresa: any = { id: null, nombre: '', cif: '', direccion: '', telefono: '' };
  formUsuario: any = { nombre: '', email: '', rol_id: 3 }; // Por defecto empleado

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.adminId = user.id;
    if (user.rol_id === 1) {
      this.cargarEmpresas();
    } else {
      alert('Acceso restringido a Administradores');
      // Aquí deberías redirigir al login o home
    }
  }

  cargarEmpresas() {
    this.adminService.getEmpresas(this.adminId).subscribe((res: any) => {
      this.empresas = res;
    });
  }

  // --- GESTIÓN EMPRESAS ---
  abrirModalEmpresa(empresa: any = null) {
    if (empresa) {
      this.formEmpresa = { ...empresa };
    } else {
      this.formEmpresa = { id: null, nombre: '', cif: '', direccion: '', telefono: '' };
    }
    const modal = new bootstrap.Modal(document.getElementById('modalEmpresa'));
    modal.show();
  }

  guardarEmpresa() {
    const payload = { ...this.formEmpresa, admin_id: this.adminId };
    this.adminService.guardarEmpresa(payload).subscribe(() => {
      this.cargarEmpresas();
      // Cerrar modal manualmente o recargar
      window.location.reload(); 
    });
  }

  borrarEmpresa(id: number) {
    if(confirm('¿Seguro? Se borrarán todos los datos y usuarios de esta empresa.')) {
      this.adminService.borrarEmpresa(id, this.adminId).subscribe(() => this.cargarEmpresas());
    }
  }

  // --- DETALLES Y USUARIOS ---
  verDetalles(empresa: any) {
    this.empresaSeleccionada = empresa;
    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    modal.show();
  }

  agregarUsuario() {
    const payload = { 
        ...this.formUsuario, 
        empresa_id: this.empresaSeleccionada.id, 
        admin_id: this.adminId 
    };
    this.adminService.crearUsuario(payload).subscribe(() => {
      alert('Usuario creado con pass: 123456');
      this.formUsuario = { nombre: '', email: '', rol_id: 3 };
      this.cargarEmpresas(); // Recargar para actualizar la lista dentro del modal (idealmente refetch solo usuarios)
      // Nota: Para ver el cambio inmediato, lo ideal es recargar la data o hacer push manual
      window.location.reload();
    });
  }

  borrarUsuario(id: number) {
    if(confirm('¿Eliminar usuario?')) {
      this.adminService.borrarUsuario(id, this.adminId).subscribe(() => {
         // Filtramos visualmente para no recargar todo
         this.empresaSeleccionada.usuarios = this.empresaSeleccionada.usuarios.filter((u:any) => u.id !== id);
      });
    }
  }
}