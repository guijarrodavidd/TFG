import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  
  private authService = inject(AuthService);
  router = inject(Router);

  usuario = { email: '', password: '' };
  
  toastVisible: boolean = false;
  toastMensaje: string = '';
  toastTipo: 'warning' | 'error' | 'success' = 'warning';
  cargando: boolean = false;

  conectar() {
    if (!this.usuario.email || !this.usuario.password) {
      this.mostrarToast('Por favor, rellena todos los campos', 'warning');
      return;
    }

    this.cargando = true;

    this.authService.login(this.usuario).subscribe({
      next: (res: any) => {
        const datosBackend = res.data || res;
        
        localStorage.setItem('token', res.token);
        const rolID = Number(datosBackend.rol_id);

        // DEPENDE DE COMO SE HAYA CREADO EL USUARIO TIENE UN ROLID U OTRO, SIRVE PARA EL GUARD
        let rolAlias = 'empleado';
        if (rolID === 1) rolAlias = 'superadmin';
        else if (rolID === 2) rolAlias = 'admin';
        else if (!rolID && datosBackend.empresa_id === null) rolAlias = 'admin';

        const usuarioFinal = { 
          ...datosBackend, 
          rol_id: rolID,
          rol: rolAlias
        };
        
        localStorage.setItem('usuario', JSON.stringify(usuarioFinal));

        // REDIRECCIÓN SEGÚN ROL
        if (rolID === 1) {
          this.mostrarToast('Acceso maestro concedido', 'success');
          this.router.navigate(['/admin']); 
        } else if (usuarioFinal.empresa_id) {
          this.router.navigate(['/dashboard/home']); 
        } else {
          // MANEJO DE ERROR SI ES ENCARGADO SIN EMPRESA
          this.mostrarToast('Login correcto. Configura tu empresa.', 'success');
          setTimeout(() => this.router.navigate(['/crear-empresa']), 1000);
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.cargando = false;
        
        let msg = 'Error de conexión';
        if (err.status === 401) {
          msg = 'Correo o contraseña incorrectos';
        } else if (err.error?.messages?.error) {
          msg = err.error.messages.error;
        } else if (err.error?.message) {
          msg = err.error.message;
        }

        this.mostrarToast(msg, 'error');
      }
    });
  }

  mostrarToast(mensaje: string, tipo: 'warning' | 'error' | 'success') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;
    setTimeout(() => {
        if (this.toastVisible) this.toastVisible = false;
    }, 3000);
  }
}