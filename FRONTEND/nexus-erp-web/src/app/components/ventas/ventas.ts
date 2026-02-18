import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../services/cliente.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.css']
})
export class VentasComponent implements OnInit {
  
  private productService = inject(ProductService);
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);

  mediaUrl = environment.mediaUrl;

  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');

  productos: any[] = [];
  categorias: any[] = [];
  listaClientes: any[] = [];

  carrito: any[] = [];
  totalVenta: number = 0;
  
  clienteNifInput: string = '';

  productosFiltrados: any[] = [];
  productosPaginados: any[] = [];
  
  textoBusqueda: string = '';
  categoriaSeleccionada: number | null = null;
  
  paginaActual: number = 1;
  itemsPorPagina: number = 9; 
  totalPaginas: number = 1;

  mensajeToast: string = '';
  tipoToast: 'success' | 'error' = 'success';

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    if (!this.usuario.empresa_id) return;

    this.productService.getCategorias(this.usuario.empresa_id).subscribe(data => {
      this.categorias = data;
    });

    this.clienteService.getClientesPorEmpresa(this.usuario.empresa_id).subscribe(data => {
      this.listaClientes = data;
    });

    this.productService.getProductosPorEmpresa(this.usuario.empresa_id).subscribe(data => {
      this.productos = data.filter((p: any) => p.estado === 'activo');
      this.aplicarFiltros();
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

    this.productosFiltrados = resultado;
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.itemsPorPagina);
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.productosPaginados = this.productosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(pag: number) {
    if (pag >= 1 && pag <= this.totalPaginas) {
      this.paginaActual = pag;
      this.actualizarPaginacion();
    }
  }

  seleccionarCategoria(catId: number | null) {
    this.categoriaSeleccionada = catId;
    this.aplicarFiltros();
  }

  agregarAlCarrito(producto: any) {
    if (producto.stock_actual <= 0) {
      this.mostrarToast(`¡El producto ${producto.nombre} está agotado!`, 'error');
      return;
    }

    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);
    const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;
    
    if (cantidadEnCarrito + 1 > producto.stock_actual) {
      this.mostrarToast(`No puedes añadir más. Solo quedan ${producto.stock_actual} unidades.`, 'error');
      return;
    }

    if (itemExistente) {
      itemExistente.cantidad++;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio_unitario;
    } else {
      this.carrito.push({
        producto: producto,
        cantidad: 1,
        precio_unitario: parseFloat(producto.precio_venta),
        subtotal: parseFloat(producto.precio_venta)
      });
    }

    this.calcularTotal();
  }

  modificarCantidad(index: number, cambio: number) {
    const item = this.carrito[index];
    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad <= 0) {
      this.eliminarDelCarrito(index);
      return;
    }

    if (cambio > 0 && nuevaCantidad > item.producto.stock_actual) {
      this.mostrarToast(`Stock insuficiente. Máximo: ${item.producto.stock_actual}`, 'error');
      return;
    }

    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * item.precio_unitario;
    this.calcularTotal();
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalVenta = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  limpiarCarrito() {
    this.carrito = [];
    this.totalVenta = 0;
    this.clienteNifInput = '';
  }

  procesarVenta() {
    if (this.carrito.length === 0) return;

    // VALIDACIÓN: El NIF es obligatorio porque la BBDD no acepta cliente NULL
    if (!this.clienteNifInput.trim()) {
        this.mostrarToast('El campo NIF/CIF del cliente es obligatorio.', 'error');
        return;
    }

    // Buscar cliente por NIF
    const clienteEncontrado = this.listaClientes.find(c => 
        c.nif && c.nif.toUpperCase() === this.clienteNifInput.trim().toUpperCase()
    );

    // VALIDACIÓN: El cliente debe existir en la base de datos
    if (!clienteEncontrado) {
        this.mostrarToast('No existe ningún cliente registrado con ese NIF/CIF.', 'error');
        return;
    }

    const datosVenta = {
      empresa_id: this.usuario.empresa_id,
      usuario_id: this.usuario.id,
      cliente_id: clienteEncontrado.id, // Usamos el ID del cliente encontrado
      total: this.totalVenta,
      detalles: this.carrito.map(item => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      }))
    };

    this.ventaService.crearVenta(datosVenta).subscribe({
      next: () => {
        this.mostrarToast('¡Venta realizada con éxito!', 'success');
        this.limpiarCarrito();
        this.cargarDatos(); 
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al procesar la venta. Revisa los datos.', 'error');
      }
    });
  }

  mostrarToast(msg: string, tipo: 'success' | 'error') {
    this.mensajeToast = msg;
    this.tipoToast = tipo;
    setTimeout(() => this.mensajeToast = '', 3000);
  }
}