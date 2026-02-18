import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  
  router = inject(Router);
  usuario: any = {};

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      console.log('Rol del usuario:', this.usuario.rol); 
    }
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}