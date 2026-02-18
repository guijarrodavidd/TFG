import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // Importante para detectar el error del Guard
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
  private route = inject(ActivatedRoute);
  
  usuario: any = {};
  
  // PASAR DATOS DASHBOARD
  rendimiento: any = { total: 0, ventas: 0 };
  ventasRecientes: any[] = [];
  equipo: any[] = [];

  // TOAST
  toastVisible: boolean = false;
  toastMensaje: string = '';
  toastTipo: 'success' | 'error' | 'warning' = 'warning';

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.cargarDatosDashboard();
    }

    // MANEJO DE ERRORES POR PERMISOS DE USUARIO
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'unauthorized') {
        this.mostrarToast('Acceso denegado: No tienes permisos para entrar ahí.', 'error');
      }
    });
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 4000);
  }

  cargarDatosDashboard() {
    this.dashboardService.getResumen(this.usuario.id).subscribe({
      next: (res: any) => {
        this.rendimiento = res.rendimiento;
        this.ventasRecientes = res.recientes;
        this.equipo = res.equipo;
      },
      error: (err) => {
        console.error('Error:', err);
        const msg = err.error?.messages?.error || 'Error al cargar datos del dashboard';
        this.mostrarToast(msg, 'error');
      }
    });
  }
}