import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-registro-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importante para formularios
  templateUrl: './registro-empleado.html'
})
export class RegistroEmpleado implements OnInit {

  http = inject(HttpClient);
  router = inject(Router);
  route = inject(ActivatedRoute); // Para leer la URL

  token: string = '';
  mensajeError: string = '';
  
  usuario = {
    nombre: '',
    email: '',
    password: ''
  };

  ngOnInit() {
    // CAPTURAMOS EL TOKEN DE LA URL (?token=XXXX)
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
      token: this.token // Enviamos el token para que el backend sepa la empresa
    };

    this.http.post('http://localhost/TFG/BACKEND/public/index.php/auth/registro-empleado', datosEnviar)
      .subscribe({
        next: (res: any) => {
          alert("¡Registro completado! Ahora puedes iniciar sesión.");
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          alert("Error al registrarse: " + (err.error?.message || "Revisa los datos"));
        }
      });
  }
}