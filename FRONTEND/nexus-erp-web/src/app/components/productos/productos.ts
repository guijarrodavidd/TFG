import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment'; // Importación clave
@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html', 
  styleUrls: ['./productos.css']
})
export class ProductosComponent implements OnInit {
  
  http = inject(HttpClient);
  router = inject(Router);
  productService = inject(ProductService);
  url = environment.apiUrl;
  
  usuario: any = {};

  // Estados de la interfaz
  cargando: boolean = true;
  modoBienvenida: boolean = false; 
  modalCategoriaAbierto: boolean = false;

  resultadosAutocomplete: any[] = [];
  mostrarAutocomplete: boolean = false;

  // Datos
  categorias: any[] = [];
  productos: any[] = [];
  
  // === VARIABLES PARA FILTRO Y PAGINACIÓN ===
  categoriaSeleccionada: any = null; // null significa "Todos"
  textoBusqueda: string = '';        // Lo que escribe el usuario
  paginaActual: number = 1;
  itemsPorPagina: number = 8;        // 8 productos por página

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

  // --- CARGA DE DATOS ---
  cargarDatos() {
    this.cargando = true;
    const idEmpresa = this.usuario.empresa_id;

    // 1. Cargar Categorías
    this.productService.getCategorias(idEmpresa)
      .subscribe({
        next: (res: any) => {
          this.categorias = res;

          if (this.categorias.length === 0) {
            this.modoBienvenida = true;
            this.cargando = false; 
          } else {
            this.modoBienvenida = false;
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
    
    this.productService.getProductoById(idEmpresa)
      .subscribe({
        next: (res: any) => {
          this.productos = res;
          this.cargando = false;
        },
        error: (err) => {
          console.error("Error al cargar productos:", err);
          this.cargando = false;
          this.productos = []; 
        }
      });
  }
  
  // --- LÓGICA DE FILTRADO UNIFICADA ---

  // 1. Getter Maestro: Aplica Categoría Y Búsqueda a la vez
  get productosFiltradosGlobal() {
    // A. Filtro por Categoría (Si no es null, filtramos)
    let lista = this.categoriaSeleccionada === null 
      ? this.productos 
      : this.productos.filter(p => p.categoria_id == this.categoriaSeleccionada);

    // B. Filtro por Texto (Nombre o SKU)
    if (this.textoBusqueda.trim()) {
      const termino = this.textoBusqueda.toLowerCase().trim();
      lista = lista.filter(p => 
        p.nombre.toLowerCase().includes(termino) || 
        (p.sku && p.sku.toLowerCase().includes(termino))
      );
    }
    
    return lista;
  }

  // 2. Paginación: Recorta la lista filtrada
  get productosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.productosFiltradosGlobal.slice(inicio, fin);
  }

  // 3. Total de páginas
  get totalPaginas() {
    return Math.ceil(this.productosFiltradosGlobal.length / this.itemsPorPagina);
  }
  // Esta es la función que te falta
  resetearPaginacion() {
    this.paginaActual = 1;
  }

  // --- INTERACCIÓN DEL USUARIO ---

  // NUEVO: Función para cambiar categoría y resetear página
  seleccionarCategoria(idCategoria: any) {
    this.categoriaSeleccionada = idCategoria;
    this.paginaActual = 1;       // Importante: Volver a la pág 1 al cambiar de categoría
    this.textoBusqueda = '';     // Opcional: ¿Quieres limpiar el buscador al cambiar de categoría? (Yo lo dejaría así para limpiar)
  }

  cambiarPagina(pag: number) {
    if (pag >= 1 && pag <= this.totalPaginas) {
      this.paginaActual = pag;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- CRUD Y MODALES ---

  irACrearProducto() {
    this.router.navigate(['/dashboard/productos/crear']);
  }
  editarProducto(producto: any) {
    this.router.navigate(['/dashboard/productos/editar', producto.id]);
  }

  crearCategoria(event?: Event) {
    if (event) {
      event.preventDefault(); // Evita que el formulario se envíe y recargue la página
      event.stopPropagation(); // Evita que el evento burbujee si el botón está dentro de un formulario
    }

    if (!this.nuevaCategoria.nombre) return;
    const body = { empresa_id: this.usuario.empresa_id, ...this.nuevaCategoria };

    this.productService.createCategoria(body)
      .subscribe({
        next: () => {
          this.nuevaCategoria.nombre = '';
          this.cerrarModalCategoria();
          this.cargarDatos(); 
        },
        error: (err) => console.error(err)
      });
  }
  onBusquedaChange() {
    this.resetearPaginacion(); // Mantenemos lo de antes

    // Lógica del Autocomplete
    const termino = this.textoBusqueda.trim().toLowerCase();
    
    if (termino.length > 0) {
      this.mostrarAutocomplete = true;
      // Filtramos sobre TODOS los productos (ignorando categoría seleccionada si quieres búsqueda global)
      this.resultadosAutocomplete = this.productos.filter(p => 
        p.nombre.toLowerCase().includes(termino) || 
        (p.sku && p.sku.toLowerCase().includes(termino))
      ).slice(0, 5); // Mostramos máximo 5 sugerencias para no saturar
    } else {
      this.mostrarAutocomplete = false;
      this.resultadosAutocomplete = [];
    }
  }

  irAlProducto(producto: any) {
    this.textoBusqueda = ''; 
    this.mostrarAutocomplete = false;
    this.editarProducto(producto); // Reutilizamos la función
  }

  // Cerrar menú si hacemos clic fuera (opcional, para UX)
  cerrarAutocomplete() {
    // Pequeño delay para permitir que el clic en el item se registre antes de cerrar
    setTimeout(() => {
      this.mostrarAutocomplete = false;
    }, 200);
  }
  
  abrirModalCategoria() { this.modalCategoriaAbierto = true; }
  cerrarModalCategoria() { this.modalCategoriaAbierto = false; }
}