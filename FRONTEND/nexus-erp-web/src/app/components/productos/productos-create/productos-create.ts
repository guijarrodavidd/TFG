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

  mediaUrl = environment.mediaUrl;
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  categorias: any[] = [];
  listaProductosTotal: any[] = []; 
  editMode: boolean = false;
  idProducto: string | null = null;
  modalBorrarVisible: boolean = false; 
  skuDuplicado: boolean = false; 

  producto: any = {
    nombre: '',
    sku: '',
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
    this.cargarTodosLosProductos(); 
    
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

  cargarTodosLosProductos() {
    this.productService.getProductosPorEmpresa(this.usuario.empresa_id).subscribe({
      next: (res: any) => this.listaProductosTotal = res,
      error: (err) => console.error('Error al cargar lista productos', err)
    });
  }

  cargarProducto(id: string) {
    this.productService.getProductoById(id).subscribe({
      next: (res: any) => {
        this.producto = res;
        if (this.producto.imagen_url) {
          this.imagePreview = this.mediaUrl + this.producto.imagen_url;
        }
      },
      error: (err) => console.error('Error al cargar producto', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  guardar() {
    this.skuDuplicado = false;

    if (this.producto.sku) {
        const skuNormalizado = this.producto.sku.trim().toUpperCase();
        const existe = this.listaProductosTotal.find(p => 
            p.sku && 
            p.sku.toUpperCase() === skuNormalizado && 
            p.id != this.idProducto 
        );

        if (existe) {
            this.skuDuplicado = true;
            return;
        }
    }

    const formData = new FormData();
    
    Object.keys(this.producto).forEach(key => {
      const valor = this.producto[key] === null ? '' : this.producto[key];
      formData.append(key, valor);
    });

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