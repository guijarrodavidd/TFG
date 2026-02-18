import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

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

  appUrl = environment.appUrl;

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.generarEnlace();
    }
  }

  generarEnlace() {
    if (!this.usuario.empresa_id) return;
    const token = this.usuario.empresa_id; // TOKEN = ID DE EMPRESA PARA PERSONALIZAR
    
    this.enlaceInvitacion = `${this.appUrl}/registro-empleado?token=${token}`;
  }

  copiarEnlace() {
    navigator.clipboard.writeText(this.enlaceInvitacion).then(() => {
      this.copiado = true;
      setTimeout(() => this.copiado = false, 2000); // A LOS DOS SEGUNDOS SE QUITA EL MSJ
    });
  }
}