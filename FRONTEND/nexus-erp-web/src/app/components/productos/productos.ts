import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class ProductosComponent implements OnInit {
  
  private productService = inject(ProductService);
  mediaUrl = environment.mediaUrl;
  
  // --- DATOS DE SESIÓN ---
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  // --- DATOS PRINCIPALES ---
  productos: any[] = [];
  categorias: any[] = [];
  
  // --- ESTADOS DE VISTA ---
  cargando: boolean = true;
  modoBienvenida: boolean = false; // Se activa si no hay categorías
  modalCategoriaAbierto: boolean = false;

  // --- FILTROS Y BÚSQUEDA ---
  categoriaSeleccionada: number | null = null;
  textoBusqueda: string = '';
  mostrarAutocomplete: boolean = false;
  resultadosAutocomplete: any[] = [];
  
  // --- PAGINACIÓN ---
  productosFiltradosGlobal: any[] = []; // Lista completa ya filtrada (antes de paginar)
  productosPaginados: any[] = [];       // Lo que se ve en pantalla (12 items)
  paginaActual: number = 1;
  itemsPorPagina: number = 12;
  totalPaginas: number = 1;

  // --- MODELO FORMULARIO CATEGORÍA ---
  nuevaCategoria = {
    nombre: ''
  };

  ngOnInit() {
    this.cargarDatos();
  }

  // 1. CARGA INICIAL (Cadena de llamadas)
  cargarDatos() {
    if (!this.usuario.empresa_id) return;
    this.cargando = true;

    // Primero cargamos categorías
    this.productService.getCategorias(this.usuario.empresa_id).subscribe({
      next: (cats: any) => {
        this.categorias = cats;

        // Si no hay categorías, activamos modo bienvenida
        if (this.categorias.length === 0) {
          this.modoBienvenida = true;
          this.cargando = false;
        } else {
          this.modoBienvenida = false;
          // Si hay categorías, cargamos productos
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
    this.productService.getProductosPorEmpresa(this.usuario.empresa_id).subscribe({
      next: (prods: any) => {
        this.productos = prods;
        this.aplicarFiltros(); // Inicializa la lista filtrada
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.cargando = false;
      }
    });
  }

  // 2. LÓGICA DE FILTRADO Y BÚSQUEDA
  aplicarFiltros() {
    let resultado = this.productos;

    // A. Filtro por Categoría
    if (this.categoriaSeleccionada !== null) {
      resultado = resultado.filter(p => p.categoria_id == this.categoriaSeleccionada);
    }

    // B. Filtro por Texto (Buscador)
    if (this.textoBusqueda.trim()) {
      const termino = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(termino) || 
        (p.sku && p.sku.toLowerCase().includes(termino))
      );
    }

    this.productosFiltradosGlobal = resultado;
    this.paginaActual = 1; // Resetear a página 1 al filtrar
    this.actualizarPaginacion();
  }

  onBusquedaChange() {
    // Lógica para el autocomplete
    if (this.textoBusqueda.length > 1) {
      this.mostrarAutocomplete = true;
      this.resultadosAutocomplete = this.productos.filter(p => 
        p.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase())
      ).slice(0, 5); // Solo mostrar 5 sugerencias
    } else {
      this.mostrarAutocomplete = false;
    }
    
    this.aplicarFiltros();
  }

  cerrarAutocomplete() {
    // Timeout pequeño para permitir que el click en la sugerencia ocurra antes de cerrar
    setTimeout(() => {
      this.mostrarAutocomplete = false;
    }, 200);
  }

  seleccionarCategoria(catId: number | null) {
    this.categoriaSeleccionada = catId;
    this.aplicarFiltros();
  }

  // 3. LÓGICA DE PAGINACIÓN
  actualizarPaginacion() {
    this.totalPaginas = Math.ceil(this.productosFiltradosGlobal.length / this.itemsPorPagina);
    
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    
    this.productosPaginados = this.productosFiltradosGlobal.slice(inicio, fin);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.actualizarPaginacion();
      // Scroll suave arriba (opcional)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // 4. GESTIÓN DE CATEGORÍAS (MODAL)
  abrirModalCategoria() {
    this.modalCategoriaAbierto = true;
  }

  cerrarModalCategoria() {
    this.modalCategoriaAbierto = false;
    this.nuevaCategoria.nombre = '';
  }

  crearCategoria(event?: Event) {
    // Prevenir submit si viene de un form
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.nuevaCategoria.nombre.trim()) return;

    const datos = {
      nombre: this.nuevaCategoria.nombre,
      empresa_id: this.usuario.empresa_id
    };

    this.productService.createCategoria(datos).subscribe({
      next: () => {
        // Recargar datos para que aparezca la nueva categoría
        this.cerrarModalCategoria();
        this.cargarDatos(); 
      },
      error: (err) => console.error('Error al crear categoría', err)
    });
  }
}