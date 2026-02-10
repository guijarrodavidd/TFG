import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-productos-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-create.html',
  styleUrls: ['./productos-create.css']
})
export class ProductosCreateComponent implements OnInit {
  
  http = inject(HttpClient);
  router = inject(Router);
  
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Listas
  listaCategorias: any[] = [];

  producto = {
    nombre: '',
    sku: '',
    categoria_id: null, // Lo vincularemos al ID real
    precio_venta: 0,    // Este será el PVP
    impuesto: 21,       // IVA Fijo
    stock_actual: 0,
    stock_minimo: 5,
    descripcion: '',
    estado: 'activo'
  };

  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  
  // Variables calculadas
  precioSinIva: number = 0;

  ngOnInit() {
    this.cargarCategorias();
    this.generarSKU(); // Generamos uno por defecto al entrar
  }

  cargarCategorias() {
    const idEmpresa = this.usuario.empresa_id;
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/categorias/empresa/${idEmpresa}`)
      .subscribe((res: any) => {
        this.listaCategorias = res;
        
        // BUSCAR CATEGORÍA 'GENERAL' PARA PONERLA POR DEFECTO
        const general = this.listaCategorias.find(c => c.nombre.toLowerCase() === 'general');
        if (general) {
          this.producto.categoria_id = general.id;
        } else if (this.listaCategorias.length > 0) {
          // Si no existe General, ponemos la primera que haya
          this.producto.categoria_id = this.listaCategorias[0].id;
        }
      });
  }

  // --- CÁLCULOS ---

  // Calculamos la base imponible a partir del PVP
  calcularBase() {
    const pvp = this.producto.precio_venta;
    const iva = this.producto.impuesto; // 21
    
    if (pvp > 0) {
      // Fórmula: Precio / 1.21
      this.precioSinIva = pvp / (1 + (iva / 100));
    } else {
      this.precioSinIva = 0;
    }
  }

  generarSKU() {
    const random = Math.floor(Math.random() * 1000000);
    this.producto.sku = 'PROD-' + random;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imagenPreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  guardarProducto() {
    console.log("🔵 Intentando guardar producto..."); // 1. Ver si entra a la función

    // Validación simple antes de enviar
    if (!this.producto.nombre || !this.producto.precio_venta) {
      alert("Por favor, rellena el nombre y el precio.");
      return;
    }

    const formData = new FormData();
    formData.append('empresa_id', this.usuario.empresa_id || '4'); // Fallback por si acaso
    
    // Añadimos campos manualmente para asegurar que van bien
    formData.append('nombre', this.producto.nombre);
    formData.append('sku', this.producto.sku);
    formData.append('descripcion', this.producto.descripcion);
    formData.append('precio_venta', this.producto.precio_venta.toString());
    formData.append('stock_actual', this.producto.stock_actual.toString());
    formData.append('stock_minimo', this.producto.stock_minimo.toString());
    formData.append('estado', this.producto.estado);

    // Enviar el ID de categoría (si es null, enviamos cadena vacía o 0)
    if (this.producto.categoria_id) {
        formData.append('categoria_id', this.producto.categoria_id);
    }

    // Enviar el Precio Base calculado (Precio Coste)
    // Si precioSinIva es NaN o 0, enviamos 0
    const coste = this.precioSinIva ? this.precioSinIva.toString() : '0';
    formData.append('precio_coste', coste);

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    // DEBUG: Ver qué estamos enviando
    console.log("📦 Datos a enviar:", {
        nombre: this.producto.nombre,
        cat: this.producto.categoria_id,
        coste: coste
    });

    this.http.post('http://localhost/TFG/BACKEND/public/index.php/productos/crear', formData)
      .subscribe({
        next: (res) => {
          console.log("✅ Respuesta servidor:", res);
          this.router.navigate(['/dashboard/productos']);
        },
        error: (err) => {
          console.error("❌ Error al guardar:", err);
          alert('Error al guardar: ' + (err.error?.messages?.error || err.message || 'Desconocido'));
        }
      });
  }
}