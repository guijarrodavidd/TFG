import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

declare var bootstrap: any;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html'
})
export class AdminComponent implements OnInit {
  adminService = inject(AdminService);
  router = inject(Router);
  
  adminId: number = 0;
  empresas: any[] = [];
  cargando: boolean = true;
  
  // Variables para Toast
  toastVisible: boolean = false;
  toastMensaje: string = '';
  toastTipo: 'success' | 'error' = 'success';

  // Variables para Borrado
  idParaBorrar: number | null = null;
  tipoBorrado: 'empresa' | 'usuario' | null = null;

  // Variables de Estado
  empresaSeleccionada: any = {};
  formEmpresa: any = { id: null, nombre: '', cif: '', direccion: '', telefono: '' };
  formUsuario: any = { nombre: '', email: '', rol_id: 3 };

  ngOnInit() {
    this.cargando = true;
    const userStr = localStorage.getItem('usuario');
    
    if (userStr) {
        const user = JSON.parse(userStr);
        this.adminId = Number(user.id);
        const rolId = Number(user.rol_id);

        // Verificación de Admin
        if (rolId === 1 || user.rol === 'superadmin') {
            this.cargarEmpresas();
        } else {
            this.cargando = false;
            this.mostrarToast('Acceso denegado: No eres administrador', 'error');
            setTimeout(() => this.router.navigate(['/login']), 2000);
        }
    } else {
        this.cargando = false;
        this.router.navigate(['/login']);
    }
  }

  cargarEmpresas() {
    this.adminService.getEmpresas(this.adminId).subscribe({
      next: (res: any) => {
        this.empresas = res;
        this.cargando = false;
        
        // Actualizar datos del modal si está abierto
        if (this.empresaSeleccionada.id) {
            const empresaActualizada = this.empresas.find(e => e.id === this.empresaSeleccionada.id);
            if(empresaActualizada) this.empresaSeleccionada = empresaActualizada;
        }
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.mostrarToast('Error al cargar empresas', 'error');
      }
    });
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.mostrarToast('Sesión cerrada correctamente', 'success');
    setTimeout(() => this.router.navigate(['/login']), 1000);
  }

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
    
    this.adminService.guardarEmpresa(payload).subscribe({
        next: (res: any) => {
            this.cargarEmpresas();
            const modalEl = document.getElementById('modalEmpresa');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance?.hide();
            this.mostrarToast(res.msg || 'Empresa guardada correctamente', 'success');
        },
        error: (err) => this.mostrarToast('Error al guardar empresa', 'error')
    });
  }

  confirmarBorrado(tipo: 'empresa' | 'usuario', id: number) {
      this.tipoBorrado = tipo;
      this.idParaBorrar = id;
      const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
      modal.show();
  }

  ejecutarBorrado() {
      const modalEl = document.getElementById('modalConfirmacion');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();

      if (this.tipoBorrado === 'empresa') {
          this.adminService.borrarEmpresa(this.idParaBorrar!, this.adminId).subscribe({
              next: () => {
                  this.cargarEmpresas();
                  this.mostrarToast('Empresa eliminada', 'success');
              },
              error: () => this.mostrarToast('Error al eliminar empresa', 'error')
          });
      } else if (this.tipoBorrado === 'usuario') {
          this.adminService.borrarUsuario(this.idParaBorrar!, this.adminId).subscribe({
              next: () => {
                this.empresaSeleccionada.usuarios = this.empresaSeleccionada.usuarios.filter((u:any) => u.id !== this.idParaBorrar);
                this.cargarEmpresas();
                this.mostrarToast('Usuario eliminado', 'success');
              },
              error: () => this.mostrarToast('Error al eliminar usuario', 'error')
          });
      }
  }

  verDetalles(empresa: any) {
    this.empresaSeleccionada = empresa;
    this.formUsuario = { nombre: '', email: '', rol_id: 3 };
    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    modal.show();
  }

  agregarUsuario() {
    const payload = { 
        ...this.formUsuario, 
        empresa_id: this.empresaSeleccionada.id, 
        admin_id: this.adminId 
    };

    this.adminService.crearUsuario(payload).subscribe({
        next: (res: any) => {
            this.mostrarToast('Usuario creado correctamente', 'success');
            this.formUsuario = { nombre: '', email: '', rol_id: 3 };
            this.cargarEmpresas();
        },
        error: (err) => this.mostrarToast('Error al crear usuario', 'error')
    });
  }
}