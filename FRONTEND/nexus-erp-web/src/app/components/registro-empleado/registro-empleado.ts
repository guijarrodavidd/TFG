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
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (!this.token) {
        this.mensajeError = "¡Error! Enlace de invitación no válido.";
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