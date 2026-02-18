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
  
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  productos: any[] = [];
  categorias: any[] = [];
  
  cargando: boolean = true;
  modoBienvenida: boolean = false; 
  modalCategoriaAbierto: boolean = false;

  modalBorrarVisible: boolean = false;
  productoIdParaBorrar: number | null = null;

  categoriaSeleccionada: number | null = null;
  textoBusqueda: string = '';
  mostrarAutocomplete: boolean = false;
  resultadosAutocomplete: any[] = [];
  
  productosFiltradosGlobal: any[] = []; 
  productosPaginados: any[] = [];       
  paginaActual: number = 1;
  itemsPorPagina: number = 12;
  totalPaginas: number = 1;

  mensajeToast: string = '';
  tipoToast: 'success' | 'error' = 'success';

  nuevaCategoria = {
    nombre: ''
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    if (!this.usuario.empresa_id) return;
    this.cargando = true;

    this.productService.getCategorias(this.usuario.empresa_id).subscribe({
      next: (cats: any) => {
        this.categorias = cats;

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
    this.productService.getProductosPorEmpresa(this.usuario.empresa_id).subscribe({
      next: (prods: any) => {
        this.productos = prods;
        this.aplicarFiltros(); 
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    let resultado = this.productos;

    if (this.categoriaSeleccionada !== null) {
      resultado = resultado.filter(p => p.categoria_id == this.categoriaSeleccionada);
    }

    if (this.textoBusqueda.trim()) {
      const termino = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(termino) || 
        (p.sku && p.sku.toLowerCase().includes(termino))
      );
    }

    this.productosFiltradosGlobal = resultado;
    this.paginaActual = 1; 
    this.actualizarPaginacion();
  }

  onBusquedaChange() {
    if (this.textoBusqueda.length > 1) {
      this.mostrarAutocomplete = true;
      this.resultadosAutocomplete = this.productos.filter(p => 
        p.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase())
      ).slice(0, 5); 
    } else {
      this.mostrarAutocomplete = false;
    }
    
    this.aplicarFiltros();
  }

  cerrarAutocomplete() {
    setTimeout(() => {
      this.mostrarAutocomplete = false;
    }, 200);
  }

  seleccionarCategoria(catId: number | null) {
    this.categoriaSeleccionada = catId;
    this.aplicarFiltros();
  }

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  abrirModalCategoria() {
    this.modalCategoriaAbierto = true;
  }

  cerrarModalCategoria() {
    this.modalCategoriaAbierto = false;
    this.nuevaCategoria.nombre = '';
  }

  crearCategoria(event?: Event) {
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
        this.cerrarModalCategoria();
        this.cargarDatos(); 
        this.mostrarToast('Categoría creada con éxito', 'success');
      },
      error: (err) => {
        console.error('Error al crear categoría', err);
        if (err.status === 409) {
          this.mostrarToast('¡Esa categoría ya existe!', 'error');
        } else {
          this.mostrarToast('Error al crear la categoría', 'error');
        }
      }
    });
  }

  abrirModalBorrar(id: number) {
    this.productoIdParaBorrar = id;
    this.modalBorrarVisible = true;
  }

  cerrarModalBorrar() {
    this.modalBorrarVisible = false;
    this.productoIdParaBorrar = null;
  }

  borrarProducto() {
    if (this.productoIdParaBorrar) {
      this.productService.borrarProducto(this.productoIdParaBorrar.toString()).subscribe({
        next: () => {
          this.cerrarModalBorrar();
          this.cargarDatos();
          this.mostrarToast('Producto eliminado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          this.cerrarModalBorrar();
          this.mostrarToast('Error al eliminar el producto', 'error');
        }
      });
    }
  }

  mostrarToast(msg: string, tipo: 'success' | 'error') {
    this.mensajeToast = msg;
    this.tipoToast = tipo;
    setTimeout(() => this.mensajeToast = '', 3000);
  }
}