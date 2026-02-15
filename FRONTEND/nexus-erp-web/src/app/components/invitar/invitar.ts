import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invitar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invitar.html'
})
export class InvitarComponent implements OnInit {

  usuario: any = {};
  enlaceInvitacion: string = '';
  copiado: boolean = false;

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.generarEnlace();
    }
  }

  generarEnlace() {
    if (!this.usuario.empresa_id) return;

    // Construimos la URL dinámica basada en el dominio actual
    const dominio = window.location.origin; // Ej: http://localhost:4200
    const token = this.usuario.empresa_id; // Usamos el ID de empresa como token simple
    
    this.enlaceInvitacion = `${dominio}/registro-empleado?token=${token}`;
  }

  copiarEnlace() {
    navigator.clipboard.writeText(this.enlaceInvitacion).then(() => {
      this.copiado = true;
      setTimeout(() => this.copiado = false, 2000); // Resetear mensaje a los 2s
    });
  }
}