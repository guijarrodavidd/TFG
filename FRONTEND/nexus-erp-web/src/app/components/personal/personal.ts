import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HolidaysWidgetComponent } from '../widgets/holidays-widget/holidays-widget';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, HolidaysWidgetComponent],
  templateUrl: './personal.html',
  styleUrls: ['./personal.css']
})
export class PersonalComponent implements OnInit, OnDestroy {
  
  http = inject(HttpClient);
  usuario: any = {};
  nombreEmpresa: string = '';

  // Datos Backend
  historialCompleto: any[] = [];
  registrosSemana: any[] = [];
  ausencias: any = {};
  nomina: any = {};
  
  // === VARIABLES PARA VACACIONES ===
  solicitudes: any[] = [];
  modalAbierto: boolean = false;
  
  nuevaSolicitud = {
    fecha_inicio: '',
    fecha_fin: '',
    comentarios: ''
  };

  diasSolicitados: number = 0;
  toast = { visible: false, mensaje: '', tipo: 'success' };
  // =================================
  
  // Control de Semana (Calendario)
  fechaInicioSemana: Date = new Date();
  fechaFinSemana: Date = new Date();
  
  // Cronómetro
  trabajando: boolean = false;
  inicioTurno: Date | null = null;
  tiempoTranscurrido: string = '0h 00m 00s';
  intervalo: any;
  workingDate: Date = new Date();

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.calcularSemanaActual();
      this.cargarDatos();
      this.cargarSolicitudes(); // <--- Cargamos el historial de vacaciones
    }
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  // 1. CARGA DE DATOS GENERALES
  cargarDatos() {
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/personal/dashboard/${this.usuario.id}`)
      .subscribe((res: any) => {
        this.nombreEmpresa = res.nombre_empresa;
        this.historialCompleto = res.historial;
        this.ausencias = res.ausencias;
        this.nomina = res.nomina;

        if (res.turno_activo) {
          this.trabajando = true;
          this.inicioTurno = new Date(res.turno_activo.entrada);
          this.iniciarCronometro();
        }

        this.filtrarRegistrosPorSemana();
      });
  }

  // === 2. LÓGICA DE VACACIONES (NUEVA) ===
  
  cargarSolicitudes() {
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/personal/solicitudes/${this.usuario.id}`)
      .subscribe((res: any) => {
        this.solicitudes = res;
      });
  }

  abrirModal() { this.modalAbierto = true; }
  cerrarModal() { this.modalAbierto = false; }

  calcularDias() {
    if (this.nuevaSolicitud.fecha_inicio && this.nuevaSolicitud.fecha_fin) {
      const inicio = new Date(this.nuevaSolicitud.fecha_inicio);
      const fin = new Date(this.nuevaSolicitud.fecha_fin);
      
      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      this.diasSolicitados = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (this.diasSolicitados < 0) this.diasSolicitados = 0;
    } else {
      this.diasSolicitados = 0;
    }
  }
  

  confirmarSolicitud() {
    if (this.diasSolicitados <= 0) {
      this.mostrarToast('Fechas inválidas', 'error');
      return;
    }

    const body = {
      usuario_id: this.usuario.id,
      ...this.nuevaSolicitud
    };

    this.http.post('http://localhost/TFG/BACKEND/public/index.php/personal/solicitar-vacaciones', body)
      .subscribe({
        next: () => {
          this.mostrarToast('Solicitud enviada correctamente', 'success');
          this.cerrarModal();
          this.cargarSolicitudes(); // Actualizar lista
          this.nuevaSolicitud = { fecha_inicio: '', fecha_fin: '', comentarios: '' }; // Reset
          this.diasSolicitados = 0;
        },
        error: () => this.mostrarToast('Error al solicitar', 'error')
      });
  }

  // Helpers para estados visuales (Colores y Texto)
  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'aprobado': return 'bg-success-subtle text-success border-success';
      case 'denegado': return 'bg-danger-subtle text-danger border-danger';
      default: return 'bg-warning-subtle text-warning-emphasis border-warning';
    }
  }

  getEstadoTexto(estado: string): string {
    switch(estado) {
      case 'aprobado': return 'Aceptado';
      case 'denegado': return 'Rechazado';
      default: return 'Pendiente';
    }
  }

  // Helper para calcular diferencia de días en el historial
  calcularDiasDiff(inicio: string, fin: string): number {
    const d1 = new Date(inicio);
    const d2 = new Date(fin);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  mostrarToast(mensaje: string, tipo: string) {
    this.toast = { visible: true, mensaje, tipo };
    setTimeout(() => this.toast.visible = false, 3000);
  }

  // ==========================================

  // 3. LÓGICA DE SEMANAS (Calendario)
  calcularSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); 
    const diffLunes = hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1);
    
    this.fechaInicioSemana = new Date(hoy.setDate(diffLunes));
    this.fechaInicioSemana.setHours(0, 0, 0, 0);

    this.fechaFinSemana = new Date(this.fechaInicioSemana);
    this.fechaFinSemana.setDate(this.fechaInicioSemana.getDate() + 6);
    this.fechaFinSemana.setHours(23, 59, 59, 999);
  }

  cambiarSemana(direccion: number) {
    this.fechaInicioSemana.setDate(this.fechaInicioSemana.getDate() + (direccion * 7));
    this.fechaFinSemana.setDate(this.fechaFinSemana.getDate() + (direccion * 7));
    
    this.fechaInicioSemana = new Date(this.fechaInicioSemana);
    this.fechaFinSemana = new Date(this.fechaFinSemana);
    
    this.filtrarRegistrosPorSemana();
  }

  // 4. FILTRO Y SUMA
  filtrarRegistrosPorSemana() {
    if (!this.historialCompleto.length) return;

    this.registrosSemana = this.historialCompleto.filter(reg => {
      const fechaRegistro = new Date(reg.entrada);
      return fechaRegistro >= this.fechaInicioSemana && fechaRegistro <= this.fechaFinSemana;
    });
  }

  get totalHorasSemana(): string {
    let sumaDecimal = 0;
    this.registrosSemana.forEach(r => {
      if (r.total_horas) sumaDecimal += parseFloat(r.total_horas);
    });
    return this.formatoHoras(sumaDecimal);
  }

  get mediaDiaria(): string {
    if (this.registrosSemana.length === 0) return '0h 00m';
    
    let sumaDecimal = 0;
    this.registrosSemana.forEach(r => { if(r.total_horas) sumaDecimal += parseFloat(r.total_horas); });
    
    const media = sumaDecimal / this.registrosSemana.length;
    return this.formatoHoras(media);
  }

  formatoHoras(decimal: any): string {
    if (!decimal) return '0h 00m';
    const num = parseFloat(decimal);
    const horas = Math.floor(num);
    const minutos = Math.round((num - horas) * 60);
    const minStr = minutos < 10 ? '0' + minutos : minutos;
    return `${horas}h ${minStr}m`;
  }

  // 5. CRONÓMETRO
  toggleFichaje() {
    const body = { 
      usuario_id: this.usuario.id, 
      empresa_id: this.usuario.empresa_id 
    };
    
    this.http.post('http://localhost/TFG/BACKEND/public/index.php/personal/fichar', body)
      .subscribe((res: any) => {
        if (res.status === 'started') {
          this.trabajando = true;
          this.inicioTurno = new Date();
          this.iniciarCronometro();
        } else {
          this.trabajando = false;
          clearInterval(this.intervalo);
          this.tiempoTranscurrido = '0h 00m 00s';
          this.cargarDatos(); 
        }
      });
  }

  iniciarCronometro() {
    if (this.intervalo) clearInterval(this.intervalo);
    
    this.intervalo = setInterval(() => {
      if (!this.inicioTurno) return;
      
      const ahora = new Date().getTime();
      const inicio = this.inicioTurno.getTime();
      const diff = ahora - inicio;

      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diff % (1000 * 60)) / 1000);

      const hStr = horas > 0 ? `${horas}h ` : '';
      const mStr = minutos < 10 ? '0' + minutos : minutos;
      const sStr = segundos < 10 ? '0' + segundos : segundos;

      this.tiempoTranscurrido = `${hStr}${mStr}m ${sStr}s`;
    }, 1000);
  }

  get saludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 21) return 'Buenas tardes';
    return 'Buenas noches';
  }
}