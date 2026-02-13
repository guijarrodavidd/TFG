import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {
  
  private clienteService = inject(ClienteService);
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  clientes: any[] = [];

  // --- VARIABLES DE ESTADO ---
  toast = {
    visible: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error' | 'warning'
  };

  // --- VARIABLES PARA EL FORMULARIO DE CREACIÓN (SOLUCIÓN DEL ERROR) ---
  dniValido: boolean = false; // Controla si el botón de guardar está activo
  
  nuevoCliente = {
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: ''
  };

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    if(!this.usuario.empresa_id) return;

    this.clienteService.getClientesPorEmpresa(this.usuario.empresa_id)
      .subscribe({
        next: (data: any) => {
          this.clientes = data;
        },
        error: (err) => {
          console.error(err);
          this.mostrarToast('Error al cargar los clientes', 'error');
        }
      });
  }

  // --- LÓGICA DE VALIDACIÓN DEL DNI ---
  // (Asegúrate de llamar a esta función en el (keyup) o (change) de tu input DNI en el HTML)
  validarDni() {
    const dni = this.nuevoCliente.dni;
    // Validación básica: que no esté vacío y tenga al menos 8 caracteres
    // Puedes añadir regex de DNI español si quieres mayor precisión
    if (dni && dni.length >= 8) {
      this.dniValido = true;
    } else {
      this.dniValido = false;
    }
  }

  // --- GUARDAR CLIENTE ---
  guardarCliente() {
    // Doble validación por seguridad
    if (!this.dniValido) {
        this.mostrarToast("El DNI introducido no es válido", "warning");
        return;
    }

    const datos = {
        ...this.nuevoCliente,
        empresa_id: this.usuario.empresa_id
    };

    this.clienteService.crearCliente(datos).subscribe({
        next: () => {
            this.mostrarToast("¡Cliente creado con éxito!", "success");
            this.cargarClientes(); // Recargamos la lista
            
            // Limpiamos el formulario
            this.nuevoCliente = { nombre: '', dni: '', email: '', telefono: '', direccion: '' };
            this.dniValido = false;
            
            // Opcional: Cerrar modal aquí si tienes referencia al modal de Bootstrap
        },
        error: (err) => {
            console.error(err);
            this.mostrarToast("Error al crear el cliente.", "error");
        }
    });
  }

  // --- UTILIDAD TOAST ---
  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success') {
    this.toast.mensaje = mensaje;
    this.toast.tipo = tipo;
    this.toast.visible = true;
    setTimeout(() => {
      this.toast.visible = false;
    }, 3000);
  }
}