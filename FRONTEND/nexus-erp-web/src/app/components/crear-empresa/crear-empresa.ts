import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmpresaService } from '../../services/empresa.service'; // <--- Service

@Component({
  selector: 'app-crear-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-empresa.html'
})
export class CrearEmpresaComponent {
  
  private empresaService = inject(EmpresaService); // <--- Inyectar
  router = inject(Router);

  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  empresa = {
    nombre: '',
    cif: '',
    direccion: '',
    telefono: ''
  };

  guardarEmpresa() {
    if (!this.usuario.id) {
        alert("Error de sesión. Vuelve a registrarte.");
        this.router.navigate(['/registro-encargado']);
        return;
    }

    const datos = {
        ...this.empresa,
        usuario_id: this.usuario.id
    };

    // USAR SERVICIO
    this.empresaService.crearEmpresa(datos).subscribe({
        next: (res: any) => {
            // Actualizar usuario en local storage con el nuevo ID de empresa
            this.usuario.empresa_id = res.id;
            localStorage.setItem('usuario', JSON.stringify(this.usuario));
            
            alert('¡Empresa creada con éxito!');
            this.router.navigate(['/dashboard']);
        },
        error: (err) => {
            console.error(err);
            alert("Error al crear la empresa.");
        }
    });
  }
}