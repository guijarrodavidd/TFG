import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {

  usuario: any = {};

  // Datos "Mock" (Falsos) para el diseño
  proyectos = [
    { nombre: 'Alexander Smith', rol: 'CEO', avatar: 'https://ui-avatars.com/api/?name=Alexander+Smith&background=random' },
    { nombre: 'Sarah Connor', rol: 'Diseñadora', avatar: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=random' },
    { nombre: 'John Doe', rol: 'Dev', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random' }
  ];

  facturas = [
    { cliente: 'Tech Solutions', estado: 'Pagado', monto: 1200, color: 'success' },
    { cliente: 'Maria Garcia', estado: 'Pendiente', monto: 350, color: 'warning' },
    { cliente: 'Nexus Inc', estado: 'Atrasado', monto: 12999, color: 'danger' }
  ];

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) this.usuario = JSON.parse(data);
  }
}