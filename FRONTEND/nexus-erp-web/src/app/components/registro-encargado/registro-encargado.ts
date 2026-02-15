import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-encargado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-encargado.html',
  styleUrls: ['./registro-encargado.css'] 
})
export class RegistroEncargado {
  
  private authService = inject(AuthService);
  router = inject(Router);

  usuario = { nombre: '', email: '', password: '' };
  
  // Estado de la seguridad de la contraseña
  fuerza = { 
    puntuacion: 0, 
    color: 'bg-danger', 
    texto: '', 
    errores: [] as string[] 
  };

  // --- LÓGICA DE VALIDACIÓN IMPLEMENTADA ---
  validarPassword() {
    const p = this.usuario.password;
    let score = 0;
    this.fuerza.errores = [];

    // 1. Si está vacía, reseteamos
    if (!p) {
        this.fuerza.puntuacion = 0;
        this.fuerza.texto = '';
        this.fuerza.color = 'bg-danger';
        return;
    }

    // 2. Reglas de puntuación
    if (p.length >= 8) score += 25;
    else this.fuerza.errores.push("Mínimo 8 caracteres.");

    if (/[A-Z]/.test(p)) score += 25;
    else this.fuerza.errores.push("Falta una mayúscula.");

    if (/[0-9]/.test(p)) score += 25;
    else this.fuerza.errores.push("Falta un número.");

    if (/[^A-Za-z0-9]/.test(p)) score += 25;
    else this.fuerza.errores.push("Falta un símbolo (!@#$).");

    this.fuerza.puntuacion = score;

    // 3. Feedback visual (Color y Texto)
    if (score < 50) {
        this.fuerza.color = 'bg-danger';
        this.fuerza.texto = 'Débil';
    } else if (score < 100) {
        this.fuerza.color = 'bg-warning';
        this.fuerza.texto = 'Mejorable';
    } else {
        this.fuerza.color = 'bg-success';
        this.fuerza.texto = 'Segura';
    }
  }

  registrar() {
    // Verificamos que la seguridad sea del 100%
    if (this.fuerza.puntuacion < 100) {
      alert("Por favor, mejora la seguridad de tu contraseña hasta que sea 'Segura'.");
      return;
    }

    const datosRegistro = { ...this.usuario, rol: 'admin' };

    this.authService.registrarEncargado(datosRegistro).subscribe({
        next: (res: any) => {
          // Guardamos sesión básica para UX inmediata
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
          const msg = err.error?.message || 'No se pudo completar el registro.';
          alert('Error: ' + msg);
        }
      });
  }
}