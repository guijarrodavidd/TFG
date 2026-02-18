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
  
  // TOASTS
  toastVisible: boolean = false;
  toastMensaje: string = '';
  toastTipo: 'warning' | 'error' | 'success' = 'warning';

  // FUERZA DE CONTRASEÑA
  fuerza = { 
    puntuacion: 0, 
    color: 'bg-danger', 
    texto: '', 
    errores: [] as string[] 
  };

  mostrarToast(mensaje: string, tipo: 'warning' | 'error' | 'success') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  validarPassword() {
    const p = this.usuario.password;
    let score = 0;
    this.fuerza.errores = [];

    if (!p) {
        this.fuerza.puntuacion = 0;
        this.fuerza.texto = '';
        this.fuerza.color = 'bg-danger';
        return;
    }

    if (p.length >= 8) score += 25;
    else this.fuerza.errores.push("Mínimo 8 caracteres.");

    if (/[A-Z]/.test(p)) score += 25;
    else this.fuerza.errores.push("Falta una mayúscula.");

    if (/[0-9]/.test(p)) score += 25;
    else this.fuerza.errores.push("Falta un número.");

    if (/[^A-Za-z0-9]/.test(p)) score += 25;
    else this.fuerza.errores.push("Falta un símbolo (!@#$).");

    this.fuerza.puntuacion = score;

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
    if (this.fuerza.puntuacion < 100) {
      this.mostrarToast("Mejora la seguridad de tu contraseña hasta que sea 'Segura'.", 'warning');
      return;
    }

    const datosRegistro = { ...this.usuario, rol_id: 2 };

    this.authService.registrarEncargado(datosRegistro).subscribe({
        next: (res: any) => {
          const usuarioLogueado = {
            id: res.id || (res.data && res.data.id), 
            nombre: this.usuario.nombre,
            email: this.usuario.email,
            rol: 'admin',
            rol_id: 2,
            empresa_id: null
          };
          localStorage.setItem('usuario', JSON.stringify(usuarioLogueado));
          
          this.mostrarToast('¡Cuenta creada! Redirigiendo a configuración...', 'success');
          setTimeout(() => this.router.navigate(['/crear-empresa']), 1500);
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'No se pudo completar el registro.';
          this.mostrarToast(msg, 'error');
        }
      });
  }
}