import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <--- IMPORTANTE

@Component({
  selector: 'app-holidays-widget',
  standalone: true, // <--- ESTA ES LA LÍNEA QUE TE FALTA Y DA EL ERROR
  imports: [CommonModule, FormsModule], // <--- Necesario para que funcione
  templateUrl: './holidays-widget.html',
  styleUrls: ['./holidays-widget.css']
})
export class HolidaysWidgetComponent implements OnInit {
  
  http = inject(HttpClient);
  
  todosLosFestivos: any[] = [];
  festivosFiltrados: any[] = [];
  cargando: boolean = true;
  error: boolean = false;

  comunidadSeleccionada: string = 'ES-VC';

  // Lista de Comunidades
  comunidades = [
    { code: 'ES-AN', nombre: 'Andalucía' },
    { code: 'ES-AR', nombre: 'Aragón' },
    { code: 'ES-AS', nombre: 'Asturias' },
    { code: 'ES-IB', nombre: 'Islas Baleares' },
    { code: 'ES-CN', nombre: 'Canarias' },
    { code: 'ES-CB', nombre: 'Cantabria' },
    { code: 'ES-CL', nombre: 'Castilla y León' },
    { code: 'ES-CM', nombre: 'Castilla-La Mancha' },
    { code: 'ES-CT', nombre: 'Cataluña' },
    { code: 'ES-VC', nombre: 'Comunidad Valenciana' },
    { code: 'ES-EX', nombre: 'Extremadura' },
    { code: 'ES-GA', nombre: 'Galicia' },
    { code: 'ES-MD', nombre: 'Comunidad de Madrid' },
    { code: 'ES-MC', nombre: 'Región de Murcia' },
    { code: 'ES-NC', nombre: 'Navarra' },
    { code: 'ES-PV', nombre: 'País Vasco' },
    { code: 'ES-RI', nombre: 'La Rioja' },
    { code: 'ES-CE', nombre: 'Ceuta' },
    { code: 'ES-ML', nombre: 'Melilla' }
  ];

  ngOnInit() {
    this.cargarFestivos();
  }

  cargarFestivos() {
    const year = new Date().getFullYear();
    
    this.http.get<any[]>(`https://date.nager.at/api/v3/publicholidays/${year}/ES`)
      .subscribe({
        next: (data) => {
          this.todosLosFestivos = data;
          this.filtrarFestivos();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error', err);
          this.error = true;
          this.cargando = false;
        }
      });
  }

  filtrarFestivos() {
    const hoy = new Date();
    
    this.festivosFiltrados = this.todosLosFestivos.filter(f => {
      const esFuturo = new Date(f.date) >= hoy;
      // Lógica: Si es global (nacional) O coincide con la comunidad seleccionada
      const aplicaAComunidad = f.global === true || (f.counties && f.counties.includes(this.comunidadSeleccionada));

      return esFuturo && aplicaAComunidad;
    }).slice(0, 3);
  }
}