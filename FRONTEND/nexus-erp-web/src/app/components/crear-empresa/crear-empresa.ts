import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmpresaService } from '../../services/empresa.service';

@Component({
  selector: 'app-crear-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-empresa.html'
})
export class CrearEmpresaComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private router = inject(Router);

  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  empresa = { nombre: '', cif: '', telefono: '', direccion: '', usuario_id: 0 };
  
  cargando = false;
  cifInvalido = false;
  telfInvalido = false;
  
  toastVisible = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' | 'warning' = 'success';

  ngOnInit() {
    if (!this.usuarioLogueado.id) {
      this.router.navigate(['/login']);
      return;
    }
    this.empresa.usuario_id = this.usuarioLogueado.id;
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  validarDatosLocales() {
    // MANEJO DE ERRORES CIF
    const regexCIF = /^B[0-9]{8}$/;
    this.cifInvalido = this.empresa.cif.length > 0 && !regexCIF.test(this.empresa.cif);

    // MANEJO DE ERRORES PARA TLF
    const regexTelf = /^[0-9]{9}$/;
    this.telfInvalido = this.empresa.telefono.length > 0 && !regexTelf.test(this.empresa.telefono);
  }

  registrarEmpresa() {
    // MANEJO DE ERRORES
    if (!this.empresa.nombre || !this.empresa.cif) {
      this.mostrarToast('Nombre y CIF son obligatorios', 'warning');
      return;
    }

    if (this.cifInvalido || this.telfInvalido) {
      this.mostrarToast('Por favor, corrige los errores del formulario', 'error');
      return;
    }

    this.cargando = true;
    this.empresaService.crearEmpresa(this.empresa).subscribe({
      next: (res: any) => {
        this.usuarioLogueado.empresa_id = res.empresa_id;
        this.usuarioLogueado.empresa_nombre = this.empresa.nombre;
        localStorage.setItem('usuario', JSON.stringify(this.usuarioLogueado));

        this.mostrarToast('¡Empresa registrada correctamente!', 'success');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard/home']);
        }, 1500);
      },
      error: (err) => {
        this.cargando = false;
        const msg = err.error?.messages?.error || 'No se pudo crear la empresa';
        this.mostrarToast(msg, 'error');
      }
    });
  }
}