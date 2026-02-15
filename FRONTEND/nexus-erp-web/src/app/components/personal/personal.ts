import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalService } from '../../services/personal.service';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal.html',
  providers: [DatePipe]
})
export class PersonalComponent implements OnInit, OnDestroy {
  
  personalService = inject(PersonalService);
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  // Variables de Estado
  fichajeActivo: any = null; 
  tiempoTrabajado: string = '00:00:00';
  fechaActual = new Date(); // Para el HTML
  lunesActual = this.getLunes(new Date()); 
  private timerInterval: any;

  // Estructura de datos segura
  datos: any = {
    usuario: {},
    nominas: [],
    solicitudes: [],
    fichajes: []
  };

  solicitud: any = { tipo: 'vacaciones', fecha_inicio: '', fecha_fin: '', comentarios: '' };

  ngOnInit() {
    this.cargarDashboard();
    // Iniciar el reloj inmediatamente
    setInterval(() => {
        if(this.fichajeActivo) this.gestionarCronometro();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // --- NAVEGACIÓN SEMANAL ---
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

  // --- FILTRO DE FICHAJES (Semana visible) ---
  get fichajesFiltrados() {
    if (!this.datos.fichajes) return [];

    const inicio = new Date(this.lunesActual);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6);
    fin.setHours(23, 59, 59, 999);

    return this.datos.fichajes.filter((f: any) => {
      // f.entrada ya es objeto Date gracias a cargarDashboard
      return f.entrada >= inicio && f.entrada <= fin;
    });
  }

  // --- LÓGICA DE FECHAS (Corrección horaria) ---
  private corregirFecha(fechaStr: string): Date {
    if (!fechaStr) return new Date();
    // Cambiar espacio por T para formato ISO
    const fecha = new Date(fechaStr.replace(' ', 'T'));
    // Sumar 1 hora (3600 * 1000 ms) para ajuste horario manual si servidor va mal
    return new Date(fecha.getTime() + 3600 * 1000); 
  }

  cargarDashboard() {
    if(!this.usuarioLogueado.id) return;

    this.personalService.getDashboard(this.usuarioLogueado.id).subscribe({
      next: (res: any) => {
        // ... (lógica de fechas que ya tienes) ...
        if (res.fichajes) {
          res.fichajes = res.fichajes.map((f: any) => ({
            ...f,
            entrada: this.corregirFecha(f.entrada),
            salida: f.salida ? this.corregirFecha(f.salida) : null
          }));
        }

        this.datos = res;
        this.fichajeActivo = res.fichaje_activo; 
        
        // ✅ ESTO ES LO IMPORTANTE: ACTUALIZAR EL NOMBRE DE LA EMPRESA
        if (res.usuario) {
            // Fusionamos los datos nuevos (que traen empresa_nombre) con los que ya teníamos
            this.usuarioLogueado = { ...this.usuarioLogueado, ...res.usuario };
            
            // Guardamos para que al recargar la página siga saliendo
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
    
    // Usamos la misma corrección para el inicio
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

  enviarSolicitud() {
    const payload = { ...this.solicitud, usuario_id: this.usuarioLogueado.id, empresa_id: this.usuarioLogueado.empresa_id };
    this.personalService.solicitarVacaciones(payload).subscribe(() => {
        alert('Solicitud enviada');
        this.cargarDashboard();
        this.solicitud = { tipo: 'vacaciones', fecha_inicio: '', fecha_fin: '', comentarios: '' };
    });
  }
}