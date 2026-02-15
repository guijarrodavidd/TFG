import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// ✅ CORRECCIÓN: Faltaba importar esto explícitamente
import { RouterModule } from '@angular/router'; 
import { RRHHService } from '../../services/rrhh.service';

@Component({
  selector: 'app-gestion-rrhh',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './gestion-rrhh.html'
})
export class GestionRRHHComponent implements OnInit {
  rrhhService = inject(RRHHService);
  usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || '{}');
  empleados: any[] = [];

  ngOnInit() {
    this.rrhhService.getUsuarios(this.usuarioLogueado.empresa_id).subscribe((res: any) => {
        // Filtramos para no mostrarse a sí mismo (admin) y solo mostrar empleados
        this.empleados = res.filter((u:any) => u.rol_id == 3);
    });
  }

  onFileSelected(event: any, userId: number, mes: string) {
    if(!mes) { alert('Selecciona el mes primero'); return; }
    
    const file = event.target.files[0];
    if(file) {
        const formData = new FormData();
        formData.append('nomina', file);
        formData.append('usuario_id', userId.toString());
        formData.append('mes', mes);

        this.rrhhService.subirNomina(formData).subscribe({
            next: () => alert('Nómina subida correctamente'),
            error: () => alert('Error al subir')
        });
    }
  }
}