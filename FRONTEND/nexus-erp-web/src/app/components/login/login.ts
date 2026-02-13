import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // <--- Importar Service

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  
  private authService = inject(AuthService); // <--- Inyectar Service
  router = inject(Router);

  usuario = { email: '', password: '' };
  
  toastVisible: boolean = false;
  toastMensaje: string = '';
  toastTipo: 'warning' | 'error' | 'success' = 'warning';
  cargando: boolean = false;

  conectar() {
    this.cargando = true;

    // USAR SERVICIO
    this.authService.login(this.usuario).subscribe({
        next: (res: any) => {
          const usuarioData = res.data || res;
          localStorage.setItem('usuario', JSON.stringify(usuarioData));

          if (usuarioData.empresa_id) {
            this.router.navigate(['/dashboard']);
          } else {
            this.mostrarToast('Primero debes crear tu empresa para continuar.', 'warning');
            setTimeout(() => this.router.navigate(['/crear-empresa']), 1500);
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Credenciales incorrectas';
          this.mostrarToast(msg, 'error');
          this.cargando = false;
        }
      });
  }

  mostrarToast(mensaje: string, tipo: 'warning' | 'error' | 'success') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}