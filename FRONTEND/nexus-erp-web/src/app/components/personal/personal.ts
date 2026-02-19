import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalService } from '../../services/personal.service';
import { HolidaysWidgetComponent } from '../widgets/holidays-widget/holidays-widget';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, HolidaysWidgetComponent],
  templateUrl: './personal.html',
  providers: [DatePipe]
})
export class PersonalComponent implements OnInit, OnDestroy {
  
  personalService = inject(PersonalService);
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  fichajeActivo: any = null; 
  tiempoTrabajado: string = '00:00:00';
  fechaActual = new Date();
  lunesActual = this.getLunes(new Date()); 
  private timerInterval: any;

  modalSolicitudAbierto: boolean = false;

  datos: any = {
    usuario: {},
    nominas: [],
    solicitudes: [],
    fichajes: []
  };

  solicitud: any = { tipo: 'vacaciones', fecha_inicio: '', fecha_fin: '', comentarios: '' };

  ngOnInit() {
    this.cargarDashboard();
    setInterval(() => {
        if(this.fichajeActivo) this.gestionarCronometro();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  getLunes(d: Date) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  }

  cambiarSemana(direccion: number) {
    const nuevaFecha = new Date(this.lunesActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion * 7));
    this.lunesActual = nuevaFecha;
  }

  get textoSemana(): string {
    const finSemana = new Date(this.lunesActual);
    finSemana.setDate(finSemana.getDate() + 6);
    return `${this.lunesActual.getDate()} ${this.lunesActual.toLocaleString('es-ES', {month:'short'})} - ${finSemana.getDate()} ${finSemana.toLocaleString('es-ES', {month:'short'})}`;
  }

  get fichajesFiltrados() {
    if (!this.datos.fichajes) return [];

    const inicio = new Date(this.lunesActual);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6);
    fin.setHours(23, 59, 59, 999);

    return this.datos.fichajes.filter((f: any) => {
      return f.entrada >= inicio && f.entrada <= fin;
    });
  }

  private corregirFecha(fechaStr: string): Date {
    if (!fechaStr) return new Date();
    const fecha = new Date(fechaStr.replace(' ', 'T'));
    return new Date(fecha.getTime() + 3600 * 1000); 
  }

  cargarDashboard() {
    if(!this.usuarioLogueado.id) return;

    this.personalService.getDashboard(this.usuarioLogueado.id).subscribe({
      next: (res: any) => {
        if (res.fichajes) {
          res.fichajes = res.fichajes.map((f: any) => ({
            ...f,
            entrada: this.corregirFecha(f.entrada),
            salida: f.salida ? this.corregirFecha(f.salida) : null
          }));
        }

        this.datos = res;
        this.fichajeActivo = res.fichaje_activo; 
        
        if (res.usuario) {
            this.usuarioLogueado = { ...this.usuarioLogueado, ...res.usuario };
            localStorage.setItem('usuario', JSON.stringify(this.usuarioLogueado));
        }

        this.gestionarCronometro();
      },
      error: (err) => console.error(err)
    });
  }

  fichar() {
    const payload = { 
        usuario_id: this.usuarioLogueado.id, 
        empresa_id: this.usuarioLogueado.empresa_id 
    };
    this.personalService.fichar(payload).subscribe({
        next: () => this.cargarDashboard(),
        error: (err) => alert('Error al fichar')
    });
  }

  gestionarCronometro() {
    if (!this.fichajeActivo || !this.fichajeActivo.entrada) {
        this.tiempoTrabajado = '00:00:00';
        return;
    }
    
    const inicio = this.corregirFecha(this.fichajeActivo.entrada).getTime();
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
  }

  abrirModalSolicitud() {
    this.modalSolicitudAbierto = true;
  }

  cerrarModalSolicitud() {
    this.modalSolicitudAbierto = false;
    this.solicitud = { tipo: 'vacaciones', fecha_inicio: '', fecha_fin: '', comentarios: '' };
  }

  enviarSolicitud() {
    const payload = { ...this.solicitud, usuario_id: this.usuarioLogueado.id, empresa_id: this.usuarioLogueado.empresa_id };
    this.personalService.solicitarVacaciones(payload).subscribe(() => {
        alert('Solicitud enviada correctamente');
        this.cargarDashboard();
        this.cerrarModalSolicitud();
    });
  }
}