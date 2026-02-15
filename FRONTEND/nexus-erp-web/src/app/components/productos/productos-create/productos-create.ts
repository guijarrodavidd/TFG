import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-productos-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productos-create.html'
})
export class ProductosCreateComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // --- CONFIGURACIÓN Y SESIÓN ---
  mediaUrl = environment.mediaUrl;
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  // --- ESTADOS DE VISTA ---
  categorias: any[] = [];
  editMode: boolean = false;
  idProducto: string | null = null;
  modalBorrarVisible: boolean = false; // Control del modal de eliminación

  // --- MODELOS ---
  producto: any = {
    nombre: '',
    descripcion: '',
    precio_venta: 0,
    stock_actual: 0,
    stock_minimo: 5,
    categoria_id: '',
    estado: 'activo',
    empresa_id: this.usuario.empresa_id
  };

  imagePreview: string | null = null;
  selectedFile: File | null = null;

  ngOnInit() {
    this.cargarCategorias();
    
    // Obtenemos el ID de la URL
    this.idProducto = this.route.snapshot.paramMap.get('id');
    
    if (this.idProducto) {
      this.editMode = true;
      this.cargarProducto(this.idProducto);
    }
  }

  cargarCategorias() {
    this.productService.getCategorias(this.usuario.empresa_id).subscribe({
      next: (res: any) => this.categorias = res,
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  cargarProducto(id: string) {
    this.productService.getProductoById(id).subscribe({
      next: (res: any) => {
        this.producto = res;
        // Si el producto ya tiene imagen en BD, cargamos la URL completa
        if (this.producto.imagen_url) {
          this.imagePreview = this.mediaUrl + this.producto.imagen_url;
        }
      },
      error: (err) => console.error('Error al cargar producto', err)
    });
  }

  // --- GESTIÓN DE IMAGEN ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        // Genera previsualización local (base64)
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // --- ACCIONES PRINCIPALES ---
  guardar() {
    const formData = new FormData();
    
    // Mapeamos el objeto producto al FormData
    Object.keys(this.producto).forEach(key => {
      // Evitamos enviar nulos como string "null"
      const valor = this.producto[key] === null ? '' : this.producto[key];
      formData.append(key, valor);
    });

    // Si hay una nueva imagen seleccionada, la añadimos
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }

    if (this.editMode && this.idProducto) {
      this.productService.updateProducto(this.idProducto, formData).subscribe({
        next: () => this.router.navigate(['/dashboard/productos']),
        error: (err) => console.error('Error al actualizar', err)
      });
    } else {
      this.productService.createProducto(formData).subscribe({
        next: () => this.router.navigate(['/dashboard/productos']),
        error: (err) => console.error('Error al crear', err)
      });
    }
  }

  // --- LÓGICA DE ELIMINACIÓN ---
  confirmarBorrado() {
    this.modalBorrarVisible = true;
  }

  ejecutarBorrado() {
    if (this.idProducto) {
      this.productService.borrarProducto(this.idProducto).subscribe({
        next: () => {
          this.modalBorrarVisible = false;
          this.router.navigate(['/dashboard/productos']);
        },
        error: (err) => {
          console.error('Error al eliminar producto', err);
          this.modalBorrarVisible = false;
        }
      });
    }
  }
}