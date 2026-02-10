import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

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
  route = inject(ActivatedRoute);
  
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Listas
  listaCategorias: any[] = [];

  // Variables de Estado y Textos
  esEdicion: boolean = false;
  productoId: string | null = null;
  
  // TEXTOS DINÁMICOS (Por defecto: modo creación)
  tituloPagina: string = 'Nuevo Producto';
  subtituloPagina: string = 'Rellena la información para añadir al catálogo.';
  textoBoton: string = 'Guardar Producto';

  // Variables para el TOAST (Notificación)
  toastVisible: boolean = false;
  toastMensaje: string = '';
  toastTipo: 'success' | 'error' = 'success';

  producto = {
    nombre: '',
    sku: '',
    categoria_id: null, 
    precio_venta: 0,    
    impuesto: 21,       
    stock_actual: 0,
    stock_minimo: 5,
    descripcion: '',
    estado: 'activo'
  };

  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  precioSinIva: number = 0;

  ngOnInit() {
    this.cargarCategorias();
    
    // DETECTAR SI ESTAMOS EDITANDO
    this.route.paramMap.subscribe(params => {
      this.productoId = params.get('id');
      
      if (this.productoId) {
        // --- MODO EDICIÓN ---
        this.esEdicion = true;
        this.tituloPagina = 'Editar Producto';
        this.subtituloPagina = 'Modifica los detalles y guarda los cambios.';
        this.textoBoton = 'Actualizar Cambios';
        
        this.cargarProductoParaEditar(this.productoId);
      } else {
        // --- MODO CREAR ---
        this.generarSKU();
      }
    });
  }

  cargarCategorias() {
    const idEmpresa = this.usuario.empresa_id;
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/categorias/empresa/${idEmpresa}`)
      .subscribe((res: any) => {
        this.listaCategorias = res;
        // Seleccionar "General" por defecto solo si es nuevo
        if (!this.esEdicion && this.listaCategorias.length > 0) {
           const general = this.listaCategorias.find(c => c.nombre.toLowerCase() === 'general');
           this.producto.categoria_id = general ? general.id : this.listaCategorias[0].id;
        }
      });
  }

  cargarProductoParaEditar(id: string) {
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/productos/${id}`)
      .subscribe({
        next: (data: any) => {
          this.producto = data;
          this.calcularBase();
          if (data.imagen_url) {
            this.imagenPreview = 'http://localhost/TFG/BACKEND/public/' + data.imagen_url;
          }
        },
        error: (err) => console.error("Error cargando producto", err)
      });
  }

  // --- CÁLCULOS Y HELPERS ---
  calcularBase() {
    const pvp = this.producto.precio_venta;
    const iva = this.producto.impuesto || 21;
    this.precioSinIva = pvp > 0 ? pvp / (1 + (iva / 100)) : 0;
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

  // --- FUNCIÓN TOAST ---
  mostrarToast(mensaje: string, tipo: 'success' | 'error') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;
    
    // Ocultar automáticamente a los 3 segundos
    setTimeout(() => {
        this.toastVisible = false;
    }, 3000);
  }

  // --- GUARDAR ---
  guardarProducto() {
    const formData = new FormData();
    formData.append('empresa_id', this.usuario.empresa_id);
    
    Object.keys(this.producto).forEach(key => {
      let value = (this.producto as any)[key];
      if (value === null) value = '';
      formData.append(key, value);
    });

    const coste = this.precioSinIva ? this.precioSinIva.toString() : '0';
    formData.append('precio_coste', coste);

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    let url = 'http://localhost/TFG/BACKEND/public/index.php/productos/crear';
    if (this.esEdicion && this.productoId) {
       url = `http://localhost/TFG/BACKEND/public/index.php/productos/actualizar/${this.productoId}`;
    }

    this.http.post(url, formData)
      .subscribe({
        next: () => {
          // 1. Mostrar mensaje de éxito
          const msg = this.esEdicion ? '¡Producto actualizado correctamente!' : '¡Producto creado con éxito!';
          this.mostrarToast(msg, 'success');

          // 2. Esperar 1.5 segundos para que el usuario lea el mensaje antes de irse
          setTimeout(() => {
              this.router.navigate(['/dashboard/productos']);
          }, 1500);
        },
        error: (err) => {
          console.error(err);
          this.mostrarToast('Hubo un error al guardar.', 'error');
        }
      });
  }
}