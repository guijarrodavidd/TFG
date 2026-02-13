import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // <--- Service

@Component({
  selector: 'app-registro-encargado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-encargado.html',
  styleUrls: ['./registro-encargado.css'] 
})
export class RegistroEncargado {
  private authService = inject(AuthService); // <--- Inyectar
  router = inject(Router);

  usuario = { nombre: '', email: '', password: '' };
  
  // (Omito la lógica de validación de password por brevedad, mantenla tal cual la tienes)
  fuerza = { puntuacion: 0, color: 'bg-danger', texto: '', errores: [] as string[] };
  validarPassword() { /* ... tu código de validación ... */ }

  registrar() {
    if (this.fuerza.puntuacion < 100) {
      alert("Por favor, mejora la seguridad de tu contraseña.");
      return;
    }

    const datosRegistro = { ...this.usuario, rol: 'admin' };

    // USAR SERVICIO
    this.authService.registrarEncargado(datosRegistro).subscribe({
        next: (res: any) => {
          const usuarioLogueado = {
            id: res.id || (res.data && res.data.id), 
            nombre: this.usuario.nombre,
            email: this.usuario.email,
            rol: 'admin',
            empresa_id: null
          };
          localStorage.setItem('usuario', JSON.stringify(usuarioLogueado));
          alert('¡Cuenta creada! Vamos a configurar tu empresa.');
          this.router.navigate(['/crear-empresa']);
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'No se pudo registrar';
          alert('Error: ' + msg);
        }
      });
  }
}