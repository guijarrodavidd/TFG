import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {

  private dashboardService = inject(DashboardService);
  
  usuario: any = {};
  
  // Datos iniciales
  rendimiento: any = { total: 0, ventas: 0 };
  ventasRecientes: any[] = [];
  equipo: any[] = [];

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.cargarDatosDashboard();
    }
  }

  cargarDatosDashboard() {
    // LLAMADA CORREGIDA: Solo enviamos el ID del usuario
    this.dashboardService.getResumen(this.usuario.id).subscribe({
      next: (res: any) => {
        console.log('Datos Dashboard:', res); // Debug en consola
        this.rendimiento = res.rendimiento;
        this.ventasRecientes = res.recientes;
        this.equipo = res.equipo;
      },
      error: (err) => {
        // Ahora si hay error, saldrá el mensaje real del backend
        console.error('Error:', err);
      }
    });
  }
}