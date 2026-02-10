import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  http = inject(HttpClient);
  router = inject(Router);

  usuario = {
    email: '',
    password: ''
  };

  conectar() {
    this.http.post('http://localhost/TFG/BACKEND/public/index.php/api/login', this.usuario)
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            localStorage.setItem('usuario', JSON.stringify(res.data));
            
            if (!res.data.empresa_id && res.data.rol_id === 2) {
              this.router.navigate(['/crear-empresa']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error: ' + (err.error?.message || 'Error de conexión'));
        }
      });
  }
}