import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.css']
})
export class VentasComponent implements OnInit {
  
  // Servicios
  private productService = inject(ProductService);
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);

  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');

  // --- DATOS PRINCIPALES ---
  productos: any[] = [];
  categorias: any[] = [];
  listaClientes: any[] = [];

  // --- CARRITO ---
  carrito: any[] = [];
  totalVenta: number = 0;
  clienteSeleccionadoId: string = '';

  // --- FILTROS Y PAGINACIÓN (Igual que en Productos) ---
  productosFiltrados: any[] = [];
  productosPaginados: any[] = [];
  
  textoBusqueda: string = '';
  categoriaSeleccionada: number | null = null;
  
  paginaActual: number = 1;
  itemsPorPagina: number = 9; // Mostramos 9 para que quepan bien con el carrito al lado
  totalPaginas: number = 1;

  // --- FEEDBACK ---
  mensajeToast: string = '';
  tipoToast: 'success' | 'error' = 'success';

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    if (!this.usuario.empresa_id) return;

    // 1. Cargar Categorías
    this.productService.getCategorias(this.usuario.empresa_id).subscribe(data => {
      this.categorias = data;
    });

    // 2. Cargar Clientes
    this.clienteService.getClientesPorEmpresa(this.usuario.empresa_id).subscribe(data => {
      this.listaClientes = data;
    });

    // 3. Cargar Productos
    this.productService.getProductosPorEmpresa(this.usuario.empresa_id).subscribe(data => {
      // Solo productos activos
      this.productos = data.filter((p: any) => p.estado === 'activo');
      this.aplicarFiltros();
    });
  }

  // --- LÓGICA DE FILTRADO ---
  aplicarFiltros() {
    let resultado = this.productos;

    // Filtro por Categoría
    if (this.categoriaSeleccionada !== null) {
      resultado = resultado.filter(p => p.categoria_id == this.categoriaSeleccionada);
    }

    // Filtro por Texto
    if (this.textoBusqueda.trim()) {
      const termino = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(termino) || 
        p.sku.toLowerCase().includes(termino)
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

  // --- LÓGICA DEL CARRITO (Con Validación de Stock) ---
  
  agregarAlCarrito(producto: any) {
    // 1. Verificar stock base
    if (producto.stock_actual <= 0) {
      this.mostrarToast(`¡El producto ${producto.nombre} está agotado!`, 'error');
      return;
    }

    // 2. Buscar si ya existe en el carrito
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);
    
    // 3. Calcular cantidad futura
    const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;
    
    // 4. VALIDACIÓN DE STOCK ESTRICTA
    if (cantidadEnCarrito + 1 > producto.stock_actual) {
      this.mostrarToast(`No puedes añadir más. Solo quedan ${producto.stock_actual} unidades.`, 'error');
      return;
    }

    // 5. Añadir o Incrementar
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

  // Modificar cantidad desde el carrito (+ / -)
  modificarCantidad(index: number, cambio: number) {
    const item = this.carrito[index];
    const nuevaCantidad = item.cantidad + cambio;

    // Eliminar si es 0
    if (nuevaCantidad <= 0) {
      this.eliminarDelCarrito(index);
      return;
    }

    // Validar Stock al incrementar
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
  }

  // --- FINALIZAR VENTA ---
  procesarVenta() {
    if (this.carrito.length === 0) return;

    const datosVenta = {
      empresa_id: this.usuario.empresa_id,
      usuario_id: this.usuario.id,
      cliente_id: this.clienteSeleccionadoId || null,
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
        // Recargar productos para actualizar el stock visualmente
        this.cargarDatos(); 
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al procesar la venta.', 'error');
      }
    });
  }

  // Helper Toast
  mostrarToast(msg: string, tipo: 'success' | 'error') {
    this.mensajeToast = msg;
    this.tipoToast = tipo;
    setTimeout(() => this.mensajeToast = '', 3000);
  }
}