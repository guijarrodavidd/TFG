import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getResumen(usuarioId: number) {
    return this.http.get(`${this.apiUrl}/dashboard/resumen/${usuarioId}`);
  }
}