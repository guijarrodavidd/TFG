import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Definimos la estructura de un ítem del carrito
interface CartItem {
  producto: any;
  cantidad: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.css']
})
export class VentasComponent implements OnInit {
  
  http = inject(HttpClient);
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Datos del Catálogo
  productos: any[] = [];
  cargando: boolean = true;
  textoBusqueda: string = '';

  // Datos del Carrito
  carrito: CartItem[] = [];
  totalVenta: number = 0;
  impuestoTotal: number = 0;
  subtotalVenta: number = 0;

  ngOnInit() {
    this.cargarProductos();
  }

  // --- CARGA DEL CATÁLOGO (Reutilizamos lógica) ---
  cargarProductos() {
    this.cargando = true;
    const idEmpresa = this.usuario.empresa_id;
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/productos/empresa/${idEmpresa}`)
      .subscribe({
        next: (res: any) => {
          // Solo mostramos productos ACTIVO
          this.productos = res.filter((p: any) => p.estado === 'activo');
          this.cargando = false;
        },
        error: (err) => {
          console.error("Error al cargar productos:", err);
          this.cargando = false;
        }
      });
  }

  // --- LÓGICA DEL CARRITO ---

  addToCart(producto: any) {
    if (producto.stock_actual <= 0) {
        alert("No hay stock disponible");
        return;
    }

    // 1. Buscamos si el producto ya está en el carrito
    const existingItem = this.carrito.find(item => item.producto.id === producto.id);

    if (existingItem) {
      // Si existe y hay stock, aumentamos cantidad
      if (existingItem.cantidad < producto.stock_actual) {
          existingItem.cantidad++;
      } else {
          alert("No puedes añadir más unidades de las que hay en stock.");
      }
    } else {
      // Si no existe, lo añadimos nuevo
      this.carrito.push({ producto: producto, cantidad: 1 });
    }
    this.calcularTotales();
  }

  removeFromCart(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotales();
  }

  updateQuantity(item: CartItem, nuevaCantidad: number) {
    if (nuevaCantidad > 0 && nuevaCantidad <= item.producto.stock_actual) {
        item.cantidad = nuevaCantidad;
    } else if (nuevaCantidad <= 0) {
        // Si baja a 0, lo quitamos (opcional, o dejarlo en 1)
        item.cantidad = 1; 
    }
    this.calcularTotales();
  }

  calcularTotales() {
    this.totalVenta = this.carrito.reduce((sum, item) => {
        return sum + (Number(item.producto.precio_venta) * item.cantidad);
    }, 0);

    // Cálculo aproximado de base e IVA (asumiendo 21% general para este ejemplo)
    this.subtotalVenta = this.totalVenta / 1.21;
    this.impuestoTotal = this.totalVenta - this.subtotalVenta;
  }

  limpiarCarrito() {
    this.carrito = [];
    this.calcularTotales();
  }

  procesarVenta() {
    if (this.carrito.length === 0) return;
    
    // Aquí irá la lógica para enviar al backend
    console.log("Procesando venta...", this.carrito);
    alert(`Venta realizada por ${this.totalVenta.toFixed(2)}€. (Funcionalidad de guardar pendiente de implementar)`);
    this.limpiarCarrito();
  }

  // --- FILTRO VISUAL ---
  get productosFiltrados() {
    if (!this.textoBusqueda.trim()) return this.productos;
    const termino = this.textoBusqueda.toLowerCase().trim();
    return this.productos.filter(p => 
      p.nombre.toLowerCase().includes(termino) || 
      (p.sku && p.sku.toLowerCase().includes(termino))
    );
  }
}