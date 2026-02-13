import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PersonalService } from '../../services/personal.service';
import { HolidaysWidgetComponent } from '../widgets/holidays-widget/holidays-widget';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, HolidaysWidgetComponent],
  templateUrl: './personal.html',
  styleUrls: ['./personal.css']
})
export class PersonalComponent implements OnInit, OnDestroy {
  
  private personalService = inject(PersonalService);
  
  usuario: any = {};
  nombreEmpresa: string = '';

  // Datos
  historialCompleto: any[] = [];
  registrosSemana: any[] = [];
  ausencias: any = {};
  nomina: any = {};
  
  // Vacaciones
  solicitudes: any[] = [];
  modalAbierto: boolean = false;
  nuevaSolicitud = { fecha_inicio: '', fecha_fin: '', comentarios: '' };
  diasSolicitados: number = 0;
  toast = { visible: false, mensaje: '', tipo: 'success' };
  
  // Calendario
  fechaInicioSemana: Date = new Date();
  fechaFinSemana: Date = new Date();
  
  // === CRONÓMETRO OPTIMIZADO ===
  trabajando: boolean = false;
  inicioTurno: Date | null = null;
  intervalo: any;
  workingDate: Date = new Date();
  
  // Objeto para la vista (evita usar splits en el HTML)
  reloj = {
    horas: '0',
    minutos: '00',
    segundos: '00'
  };

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.calcularSemanaActual();
      this.cargarDatos();
      this.cargarSolicitudes();
    }
  }

  ngOnDestroy() {
    this.detenerCronometro();
  }

  // --- 1. CARGA DE DATOS ---
  cargarDatos() {
    if (!this.usuario.id) return;

    this.personalService.getDashboard(this.usuario.id).subscribe({
      next: (res: any) => {
        this.nombreEmpresa = res.nombre_empresa;
        this.historialCompleto = res.historial || [];
        this.ausencias = res.ausencias;
        this.nomina = res.nomina;

        if (res.turno_activo) {
          this.trabajando = true;
          // ✅ CORRECCIÓN DE HORA: Interpretamos la fecha del server como UTC
          this.inicioTurno = this.parseFechaUTC(res.turno_activo.entrada);
          this.iniciarCronometro();
        } else {
          this.trabajando = false;
          this.detenerCronometro();
        }

        this.filtrarRegistrosPorSemana();
      },
      error: (err) => console.error(err)
    });
  }

  // --- HELPER PARA FECHAS SERVER (SOLUCIÓN DEL PROBLEMA 1h) ---
  private parseFechaUTC(fechaStr: string): Date {
    // Si viene formato SQL "YYYY-MM-DD HH:mm:ss" sin zona, le añadimos 'Z'
    // para que el navegador sepa que es UTC y la convierta a hora local correctamente.
    if (fechaStr && !fechaStr.includes('Z')) {
       return new Date(fechaStr.replace(' ', 'T') + 'Z');
    }
    return new Date(fechaStr);
  }

  // --- 2. FICHAJE ---
  toggleFichaje() {
    const datos = { usuario_id: this.usuario.id, empresa_id: this.usuario.empresa_id };
    
    // 1. Feedback inmediato local (UX rápida)
    if (!this.trabajando) {
        this.trabajando = true;
        this.inicioTurno = new Date(); // Hora local exacta
        this.iniciarCronometro();
    } else {
        this.trabajando = false;
        this.detenerCronometro();
        this.reloj = { horas: '0', minutos: '00', segundos: '00' };
    }

    // 2. Llamada al servidor
    this.personalService.fichar(datos).subscribe({
      next: (res: any) => {
        this.mostrarToast(this.trabajando ? '¡Entrada registrada!' : '¡Salida registrada!', 'success');
        // Recargamos para actualizar la tabla, pero el cronómetro ya está corriendo bien
        this.cargarDatos(); 
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error de conexión', 'error');
        // Revertir estado si falla
        this.trabajando = !this.trabajando;
        this.cargarDatos();
      }
    });
  }

  // --- 3. LÓGICA DEL RELOJ ---
  iniciarCronometro() {
    this.detenerCronometro();
    this.actualizarReloj(); // Ejecutar ya
    
    this.intervalo = setInterval(() => {
      this.actualizarReloj();
    }, 1000);
  }

  actualizarReloj() {
    if (!this.inicioTurno) return;
    
    const ahora = new Date().getTime();
    const inicio = this.inicioTurno.getTime();
    let diff = ahora - inicio;

    if (diff < 0) diff = 0; // Protección contra negativos

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    this.reloj = {
      horas: h.toString(),
      minutos: m < 10 ? '0' + m : m.toString(),
      segundos: s < 10 ? '0' + s : s.toString()
    };
  }

  detenerCronometro() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  // --- RESTO DE FUNCIONES (Vacaciones, Helpers, etc) ---
  // (Mantén el resto de tu código igual: cargarSolicitudes, confirmarSolicitud, etc.)
  
  cargarSolicitudes() {
    this.personalService.getSolicitudes(this.usuario.id).subscribe({
      next: (res: any) => this.solicitudes = res,
      error: (err) => console.error(err)
    });
  }

  abrirModal() { this.modalAbierto = true; }
  cerrarModal() { this.modalAbierto = false; }

  confirmarSolicitud() { /* ... tu código ... */ }
  calcularDias() { /* ... tu código ... */ }
  mostrarToast(mensaje: string, tipo: string) {
    this.toast = { visible: true, mensaje, tipo };
    setTimeout(() => this.toast.visible = false, 3000);
  }
  
  calcularSemanaActual() { /* ... tu código ... */ }
  cambiarSemana(dir: number) { /* ... tu código ... */ }
  filtrarRegistrosPorSemana() { /* ... tu código ... */ }
  
  // Getters para HTML
  get totalHorasSemana(): string { return '...'; /* tu logica */ }
  get mediaDiaria(): string { return '...'; /* tu logica */ }
  get saludo(): string { 
     const h = new Date().getHours();
     return h < 12 ? 'Buenos días' : (h < 21 ? 'Buenas tardes' : 'Buenas noches');
  }
  
  // Helpers visuales
  getEstadoClass(e: string) { return '...'; }
  getEstadoTexto(e: string) { return '...'; }
  calcularDiasDiff(i: string, f: string) { return 0; }
  formatoHoras(d: any) { return '...'; }
}