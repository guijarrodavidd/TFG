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

    this.authService.login(this.usuario).subscribe({
        next: (res: any) => {
          const datosBackend = res.data || res;
          
          console.group("🔍 DEBUG LOGIN");
          console.log("Rol ID recibido:", datosBackend.rol_id);
          
          // --- ADAPTADOR DE ROLES (BASE DE DATOS -> FRONTEND) ---
          let rolEstimado = 'empleado'; // Por defecto (rol_id 3)

          // Convertimos a número para asegurar la comparación
          const rolID = Number(datosBackend.rol_id);

          switch (rolID) {
              case 1:
                  rolEstimado = 'superadmin'; // Administrador Global (si existe)
                  break;
              case 2:
                  rolEstimado = 'admin'; // ✅ EL ENCARGADO ES EL 'ADMIN' EN EL FRONTEND
                  break;
              case 3:
                  rolEstimado = 'empleado'; // Empleado normal
                  break;
              default:
                  // Si no tiene rol pero no tiene empresa, asumimos que es un jefe registrándose
                  if (datosBackend.empresa_id === null) {
                      rolEstimado = 'admin';
                  }
                  break;
          }
          console.log("Rol Asignado al Frontend:", rolEstimado);
          console.groupEnd();
          // ------------------------------------------------------

          const usuarioFinal = {
            ...datosBackend,
            rol: rolEstimado 
          };
          
          localStorage.setItem('usuario', JSON.stringify(usuarioFinal));

          if (usuarioFinal.empresa_id) {
            this.router.navigate(['/dashboard']);
          } else {
            this.mostrarToast('Bienvenido. Vamos a crear tu empresa.', 'success');
            setTimeout(() => this.router.navigate(['/crear-empresa']), 1000);
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