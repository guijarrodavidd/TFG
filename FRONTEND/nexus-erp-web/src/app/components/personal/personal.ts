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
  registrosSemana: any[] = []; // Lo que se ve en la tabla derecha
  ausencias: any = {};
  nomina: any = {};
  
  // Vacaciones
  solicitudes: any[] = [];
  modalAbierto: boolean = false;
  nuevaSolicitud = { fecha_inicio: '', fecha_fin: '', comentarios: '' };
  diasSolicitados: number = 0;
  toast = { visible: false, mensaje: '', tipo: 'success' };
  
  // Calendario Semanal
  fechaInicioSemana: Date = new Date();
  fechaFinSemana: Date = new Date();
  
  // Cronómetro
  trabajando: boolean = false;
  inicioTurno: Date | null = null;
  intervalo: any;
  workingDate: Date = new Date(); // Fecha de hoy para el widget
  
  reloj = { horas: '0', minutos: '00', segundos: '00' };

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.calcularSemanaActual(); // 1. Primero calculamos las fechas
      this.cargarDatos();          // 2. Luego cargamos los datos
      this.cargarSolicitudes();
    }
  }

  ngOnDestroy() {
    this.detenerCronometro();
  }

  // --- 1. CARGA Y PROCESAMIENTO DE DATOS ---
  cargarDatos() {
    if (!this.usuario.id) return;

    this.personalService.getDashboard(this.usuario.id).subscribe({
      next: (res: any) => {
        this.nombreEmpresa = res.nombre_empresa;
        
        // TRANSFORMACIÓN DE DATOS (Vital para que funcione el filtro)
        // Convertimos las fechas string '2024-02-14' a Objetos Date reales
        this.historialCompleto = (res.historial || []).map((h: any) => ({
            ...h,
            entrada: this.parseFechaUTC(h.entrada), // Convertimos entrada
            salida: h.salida ? this.parseFechaUTC(h.salida) : null // Convertimos salida si existe
        }));

        this.ausencias = res.ausencias;
        this.nomina = res.nomina;

        // Estado del cronómetro
        if (res.turno_activo) {
          this.trabajando = true;
          this.inicioTurno = this.parseFechaUTC(res.turno_activo.entrada);
          this.iniciarCronometro();
        } else {
          this.trabajando = false;
          this.detenerCronometro();
        }

        // Aplicamos el filtro visual
        this.filtrarRegistrosPorSemana();
      },
      error: (err) => console.error(err)
    });
  }

  // Helper para convertir fechas SQL UTC a Local
  private parseFechaUTC(fechaStr: string): Date {
    if (!fechaStr) return new Date();
    // Añadimos 'Z' si falta para asegurar que JS lo trate como UTC y lo pinte en hora local
    if (!fechaStr.includes('Z')) {
       return new Date(fechaStr.replace(' ', 'T') + 'Z');
    }
    return new Date(fechaStr);
  }

  // --- 2. LÓGICA DE CALENDARIO (Arreglo del Lunes - Domingo) ---
  calcularSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 (Domingo) - 6 (Sábado)
    
    // Calcular distancia al Lunes pasado
    // Si es Domingo (0), restamos 6 días. Si es otro, restamos diaSemana - 1
    const distanciaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - distanciaLunes);
    lunes.setHours(0, 0, 0, 0); // Inicio del día absoluto

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999); // Final del día absoluto

    this.fechaInicioSemana = lunes;
    this.fechaFinSemana = domingo;
  }

  cambiarSemana(direccion: number) {
    // Clonamos para disparar detección de cambios en Angular
    const nuevoInicio = new Date(this.fechaInicioSemana);
    nuevoInicio.setDate(nuevoInicio.getDate() + (direccion * 7));
    
    const nuevoFin = new Date(nuevoInicio);
    nuevoFin.setDate(nuevoInicio.getDate() + 6);
    nuevoFin.setHours(23, 59, 59, 999);

    this.fechaInicioSemana = nuevoInicio;
    this.fechaFinSemana = nuevoFin;
    
    this.filtrarRegistrosPorSemana();
  }

  filtrarRegistrosPorSemana() {
    if (!this.historialCompleto.length) {
        this.registrosSemana = [];
        return;
    }

    // Filtramos comparando Objetos Date (ahora sí funciona)
    this.registrosSemana = this.historialCompleto.filter(reg => {
      return reg.entrada >= this.fechaInicioSemana && reg.entrada <= this.fechaFinSemana;
    });

    // Ordenamos: Lo más reciente arriba
    this.registrosSemana.sort((a, b) => b.entrada.getTime() - a.entrada.getTime());
  }

  // --- 3. FICHAJE ---
  toggleFichaje() {
    const datos = { usuario_id: this.usuario.id, empresa_id: this.usuario.empresa_id };
    
    // Feedback instantáneo (Optimistic UI)
    if (!this.trabajando) {
        this.trabajando = true;
        this.inicioTurno = new Date();
        this.iniciarCronometro();
    } else {
        this.trabajando = false;
        this.detenerCronometro();
        this.reloj = { horas: '0', minutos: '00', segundos: '00' };
    }

    this.personalService.fichar(datos).subscribe({
      next: () => {
        this.mostrarToast(this.trabajando ? '¡Entrada registrada!' : '¡Salida registrada!', 'success');
        this.cargarDatos(); // Recargar tabla
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error de conexión', 'error');
        this.trabajando = !this.trabajando; // Revertir si falla
        this.cargarDatos();
      }
    });
  }

  // --- 4. CRONÓMETRO ---
  iniciarCronometro() {
    this.detenerCronometro();
    this.actualizarReloj();
    this.intervalo = setInterval(() => this.actualizarReloj(), 1000);
  }

  actualizarReloj() {
    if (!this.inicioTurno) return;
    const diff = Math.max(0, new Date().getTime() - this.inicioTurno.getTime());
    
    this.reloj = {
      horas: Math.floor(diff / 3600000).toString(),
      minutos: Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0'),
      segundos: Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
    };
  }

  detenerCronometro() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  // --- 5. GETTERS (Arreglo del "... / 40h") ---
  get totalHorasSemana(): string {
    if (!this.registrosSemana || this.registrosSemana.length === 0) return '0h 00m';

    let sumaDecimal = 0;
    this.registrosSemana.forEach(r => {
      // Solo sumamos si hay total_horas (si ya fichó salida)
      if (r.total_horas) sumaDecimal += parseFloat(r.total_horas);
    });
    return this.formatoHoras(sumaDecimal);
  }

  get mediaDiaria(): string {
    if (!this.registrosSemana || this.registrosSemana.length === 0) return '0h 00m';
    
    let sumaDecimal = 0;
    let diasContados = 0;
    
    this.registrosSemana.forEach(r => { 
        if(r.total_horas) {
            sumaDecimal += parseFloat(r.total_horas);
            diasContados++;
        }
    });
    
    if (diasContados === 0) return '0h 00m';
    return this.formatoHoras(sumaDecimal / diasContados);
  }

  formatoHoras(decimal: any): string {
    const num = parseFloat(decimal) || 0; // Si es NaN o null, usa 0
    const horas = Math.floor(num);
    const minutos = Math.round((num - horas) * 60);
    return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  }

  get saludo(): string {
     const h = new Date().getHours();
     return h < 12 ? 'Buenos días' : (h < 21 ? 'Buenas tardes' : 'Buenas noches');
  }

  // --- RESTO (Vacaciones, Modales) ---
  cargarSolicitudes() {
    this.personalService.getSolicitudes(this.usuario.id).subscribe({
      next: (res: any) => this.solicitudes = res,
      error: (err) => console.error(err)
    });
  }

  abrirModal() { this.modalAbierto = true; }
  cerrarModal() { this.modalAbierto = false; }
  
  confirmarSolicitud() { /* Lógica existente */ }
  calcularDias() { /* Lógica existente */ }
  
  mostrarToast(mensaje: string, tipo: string) {
    this.toast = { visible: true, mensaje, tipo };
    setTimeout(() => this.toast.visible = false, 3000);
  }

  getEstadoClass(estado: string) { /* Lógica existente */ return ''; }
  getEstadoTexto(estado: string) { /* Lógica existente */ return ''; }
  calcularDiasDiff(inicio: string, fin: string) { return 0; }
}