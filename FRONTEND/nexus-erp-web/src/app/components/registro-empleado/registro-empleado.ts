import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// 1. Importamos el servicio
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-empleado.html'
})
export class RegistroEmpleado implements OnInit {

  // 2. Inyectamos AuthService en lugar de HttpClient
  private authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  token: string = '';
  mensajeError: string = '';
  
  usuario = {
    nombre: '',
    email: '',
    password: ''
  };

  ngOnInit() {
    // Verificamos si hay usuario logueado (Jefe registrando)
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esJefe = usuarioLogueado.rol === 'admin';

    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      // Si no hay token Y NO es el jefe logueado -> Error
      if (!this.token && !esJefe) {
        this.mensajeError = "¡Error! Enlace de invitación no válido.";
      } else if (esJefe) {
        // Si es jefe, usamos su ID de empresa como token "automático"
        this.token = usuarioLogueado.empresa_id; 
      }
    });
  }

  registrarse() {
    if (!this.token) return;

    const datosEnviar = {
      ...this.usuario,
      token: this.token
    };

    // 3. Usamos el método del servicio
    // Sintaxis limpia y legible
    this.authService.registrarEmpleado(datosEnviar)
      .subscribe({
        next: (res: any) => {
          alert("¡Registro completado! Ahora puedes iniciar sesión.");
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          // Gestión de errores centralizada en la respuesta
          alert("Error al registrarse: " + (err.error?.message || "Revisa los datos"));
        }
      });
  }
}