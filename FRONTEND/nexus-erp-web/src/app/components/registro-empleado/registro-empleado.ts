import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-empleado.html'
})
export class RegistroEmpleado implements OnInit {

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
    // VERIFICA SI HAY ADMIN LOGUEADO
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esJefe = usuarioLogueado.rol === 'admin';

    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      // NO TOKEN Y NO JEFE -> ERROR
      if (!this.token && !esJefe) {
        this.mensajeError = "¡Error! Enlace de invitación no válido.";
      } else if (esJefe) {
        // SI ES JEFE USAR SU ID EMPRESA COMO TOKEN
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

    // LLAMAR AL SERVICE PARA REGISTRO Y CUANDO SE ENVIE LLEVAR A INICIAR SESION
    this.authService.registrarEmpleado(datosEnviar)
      .subscribe({
        next: (res: any) => {
          alert("¡Registro completado! Ahora puedes iniciar sesión.");
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          // MANEJO DE ERRORES CON ERROR PERSONALIZADO
          alert("Error al registrarse: " + (err.error?.message || "Revisa los datos"));
        }
      });
  }
}