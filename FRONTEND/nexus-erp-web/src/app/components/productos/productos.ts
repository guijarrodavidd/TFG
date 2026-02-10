import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Necesario para navegar a "crear producto"
import { FormsModule } from '@angular/forms'; // Necesario para el formulario de categorías

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html', // Asegúrate de que coincida con tu archivo
  styleUrls: ['./productos.css']
})
export class ProductosComponent implements OnInit {
  
  http = inject(HttpClient);
  router = inject(Router); // Inyectamos el Router
  
  usuario: any = {};

  // Estados de la interfaz
  cargando: boolean = true;
  modoBienvenida: boolean = false; // Se activa si la tienda está vacía de categorías
  modalCategoriaAbierto: boolean = false;

  // Datos
  categorias: any[] = [];
  productos: any[] = [];
  
  // Filtros
  categoriaSeleccionada: any = null; // null significa "Todos"

  // Modelo para el formulario de nueva categoría
  nuevaCategoria = {
    nombre: '',
    descripcion: ''
  };

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.cargarDatos();
    }
  }

  // --- LÓGICA PRINCIPAL ---
  cargarDatos() {
    this.cargando = true;
    const idEmpresa = this.usuario.empresa_id;

    // 1. Primero cargamos las categorías
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/categorias/empresa/${idEmpresa}`)
      .subscribe({
        next: (res: any) => {
          this.categorias = res;

          // DECISIÓN: ¿Mostramos bienvenida o dashboard normal?
          if (this.categorias.length === 0) {
            this.modoBienvenida = true;
            this.cargando = false; // Dejamos de cargar, mostramos bienvenida
          } else {
            this.modoBienvenida = false;
            // Si ya hay categorías, cargamos los productos
            this.cargarProductos();
          }
        },
        error: (err) => {
          console.error('Error cargando categorías', err);
          this.cargando = false;
        }
      });
  }

  cargarProductos() {
    const idEmpresa = this.usuario.empresa_id;
    // Asumimos que tienes una ruta para obtener productos por empresa
    // Si aún no la tienes, esto devolverá error 404 pero no romperá la app visualmente
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/productos/empresa/${idEmpresa}`)
      .subscribe({
        next: (res: any) => {
          this.productos = res;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando productos', err);
          this.cargando = false;
          this.productos = []; // Se queda vacío pero funcional
        }
      });
  }

  // --- ACCIONES ---

  // Navegar a la pantalla de crear producto
  irACrearProducto() {
    this.router.navigate(['/dashboard/productos/crear']);
  }

  // Crear categoría (Tanto desde el modo bienvenida como desde el modal)
  crearCategoria() {
    if (!this.nuevaCategoria.nombre) return;

    const body = {
      empresa_id: this.usuario.empresa_id,
      nombre: this.nuevaCategoria.nombre,
      descripcion: this.nuevaCategoria.descripcion
    };

    this.http.post('http://localhost/TFG/BACKEND/public/index.php/categorias/crear', body)
      .subscribe({
        next: () => {
          // Éxito: Limpiamos y recargamos
          this.nuevaCategoria.nombre = '';
          this.cerrarModalCategoria();
          
          // Al recargar, como ya habrá 1 categoría, el sistema saldrá solo del modo bienvenida
          this.cargarDatos(); 
        },
        error: (err) => console.error('Error creando categoría', err)
      });
  }

  // --- MODAL ---
  abrirModalCategoria() { this.modalCategoriaAbierto = true; }
  cerrarModalCategoria() { this.modalCategoriaAbierto = false; }

  // --- HELPER PARA FILTRAR EN EL HTML ---
  getProductosFiltrados() {
    if (this.categoriaSeleccionada === null) {
      return this.productos;
    }
    // Asegúrate de que en tu BD el campo se llame 'categoria_id'
    return this.productos.filter(p => p.categoria_id == this.categoriaSeleccionada);
  }
}