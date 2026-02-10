import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro-encargado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-encargado.html',
  styleUrls: ['./registro-encargado.css'] // Asegúrate de crear este archivo CSS si no existe
})
export class RegistroEncargado {
  http = inject(HttpClient);
  router = inject(Router);

  usuario = {
    nombre: '',
    email: '',
    password: ''
  };

  // Variables para la barra de fuerza
  fuerza = {
    puntuacion: 0,        // 0 a 100
    color: 'bg-danger',   // Clase de Bootstrap
    texto: '',            // Mensaje
    errores: [] as string[] // Lista de requisitos no cumplidos
  };

  // Esta función se ejecuta en cada tecla pulsada (keyup)
  validarPassword() {
    const p = this.usuario.password;
    const n = this.usuario.nombre.toLowerCase();
    
    let errores = [];
    let score = 0;

    // 1. Longitud mínima
    if (p.length < 8) {
      errores.push("Mínimo 8 caracteres");
    } else {
      score += 20;
    }

    // 2. Mayúsculas
    if (!/[A-Z]/.test(p)) {
      errores.push("Falta una mayúscula");
    } else {
      score += 20;
    }

    // 3. Minúsculas
    if (!/[a-z]/.test(p)) {
      errores.push("Falta una minúscula");
    } else {
      score += 20;
    }

    // 4. Números
    if (!/[0-9]/.test(p)) {
      errores.push("Falta un número");
    } else {
      score += 20;
    }

    // 5. Caracteres especiales
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)) {
      errores.push("Falta un carácter especial (@, #, $, etc.)");
    } else {
      score += 20;
    }

    // 6. No contener el nombre (Regla Crítica)
    // Solo comprobamos si el nombre tiene más de 3 letras para evitar falsos positivos con nombres cortos
    if (n.length > 3 && p.toLowerCase().includes(n)) {
      errores.push("No puede contener tu nombre");
      score = 0; // Penalización total
    }

    // Calcular estado visual
    this.fuerza.errores = errores;
    this.fuerza.puntuacion = score;

    if (score < 50) {
      this.fuerza.color = 'bg-danger';
      this.fuerza.texto = '¡Poco segura!';
    } else if (score < 100) {
      this.fuerza.color = 'bg-warning';
      this.fuerza.texto = '¡Bien!';
    } else {
      this.fuerza.color = 'bg-success';
      this.fuerza.texto = '¡Muy segura!';
    }
  }

  registrar() {
    // Bloquear si la contraseña no es segura (100 puntos)
    if (this.fuerza.puntuacion < 100) {
      alert("Por favor, mejora la seguridad de tu contraseña antes de continuar.");
      return;
    }

    this.http.post('http://localhost/TFG/BACKEND/public/index.php/auth/registro-encargado', this.usuario)
      .subscribe({
        next: () => {
          alert('¡Cuenta creada! Ahora inicia sesión.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert('Error: ' + (err.error?.message || 'No se pudo registrar'));
        }
      });
  }
}