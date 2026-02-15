import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalService } from '../../services/personal.service';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal.html'
})
export class PersonalComponent implements OnInit, OnDestroy {
  
  personalService = inject(PersonalService);
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  fichajeActivo: any = null; 
  tiempoTrabajado: string = '00:00:00';
  private timerInterval: any;

  datos: any = {
    usuario: {},
    nominas: [],
    solicitudes: [],
    fichajes: [] // Aquí guardamos el historial
  };

  solicitud: any = { tipo: 'vacaciones', fecha_inicio: '', fecha_fin: '', comentarios: '' };

  ngOnInit() {
    this.cargarDashboard();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // ✅ Función para corregir el desfase de 1 hora del servidor
  private corregirFecha(fechaStr: string): Date {
    if (!fechaStr) return new Date();
    // Convertimos formato SQL a ISO
    const fecha = new Date(fechaStr.replace(' ', 'T'));
    // Sumamos 1 hora (3600000 ms)
    return new Date(fecha.getTime() + 3600 * 1000);
  }

  cargarDashboard() {
    if(!this.usuarioLogueado.id) return;

    this.personalService.getDashboard(this.usuarioLogueado.id).subscribe({
      next: (res: any) => {
        // Procesamos los fichajes del historial para que salgan con +1 hora
        if (res.fichajes) {
          res.fichajes = res.fichajes.map((f: any) => ({
            ...f,
            entrada: this.corregirFecha(f.entrada),
            salida: f.salida ? this.corregirFecha(f.salida) : null
          }));
        }

        this.datos = res;
        this.fichajeActivo = res.fichaje_activo; 

        if (res.usuario?.dias_disponibles !== undefined) {
            this.usuarioLogueado.dias_disponibles = res.usuario.dias_disponibles;
            localStorage.setItem('usuario', JSON.stringify(this.usuarioLogueado));
        }

        this.gestionarCronometro();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  fichar() {
    const payload = { usuario_id: this.usuarioLogueado.id, empresa_id: this.usuarioLogueado.empresa_id };
    this.personalService.fichar(payload).subscribe({
        next: () => this.cargarDashboard(),
        error: (err) => console.error(err)
    });
  }

  gestionarCronometro() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (this.fichajeActivo && this.fichajeActivo.entrada) {
      // Usamos la función de corrección para el inicio del cronómetro
      const inicio = this.corregirFecha(this.fichajeActivo.entrada).getTime();

      this.timerInterval = setInterval(() => {
        const ahora = new Date().getTime();
        let diferencia = ahora - inicio;

        if (diferencia < 0) diferencia = 0;

        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        this.tiempoTrabajado = 
          (horas < 10 ? '0' + horas : horas) + ':' + 
          (minutos < 10 ? '0' + minutos : minutos) + ':' + 
          (segundos < 10 ? '0' + segundos : segundos);
      }, 1000);
    } else {
      this.tiempoTrabajado = '00:00:00';
    }
  }

  enviarSolicitud() {
    const payload = { ...this.solicitud, usuario_id: this.usuarioLogueado.id, empresa_id: this.usuarioLogueado.empresa_id };
    this.personalService.solicitarVacaciones(payload).subscribe({
        next: () => {
            alert('Enviada');
            this.cargarDashboard();
            this.solicitud = { tipo: 'vacaciones', fecha_inicio: '', fecha_fin: '', comentarios: '' };
        }
    });
  }
}