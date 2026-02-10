import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-empresa.html'
})
export class CrearEmpresa {
  
  http = inject(HttpClient);
  router = inject(Router);

  // URL del Backend
  private API_URL = 'http://localhost/TFG/BACKEND/public/index.php/empresa/crear';

  empresa = {
    nombre: '',
    cif: '',
    telefono: '',
    direccion: ''
  };

  guardarEmpresa() {

    const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!usuarioActual.id) {
      alert("Error de sesión. Vuelve a loguearte.");
      return;
    }

    const datosEnviar = {
      ...this.empresa,
      usuario_id: usuarioActual.id
    };

    this.http.post(this.API_URL, datosEnviar).subscribe({
      next: (res: any) => {
        console.log("Empresa creada:", res);
        
        usuarioActual.empresa_id = res.data.empresa_id;
        localStorage.setItem('usuario', JSON.stringify(usuarioActual));

        alert(`¡Felicidades! Empresa creada. Tu código de invitación es: ${res.data.token}`);
        
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        alert("Error al crear la empresa. Revisa la consola.");
      }
    });
  }
}