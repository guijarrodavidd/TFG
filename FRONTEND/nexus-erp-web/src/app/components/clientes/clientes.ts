import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';

// Declaramos bootstrap para poder cerrar el modal manualmente si fuera necesario
declare var bootstrap: any;

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
  
  // Variables de estado
  toast = { visible: false, mensaje: '', tipo: 'success' as 'success' | 'error' | 'warning' };
  modoEdicion: boolean = false;
  dniValido: boolean = true; 

  // Datos para los modales
  clienteSeleccionado: any = null;
  
  // Inicialización ROBUSTA (Evita el error 'undefined reading length')
  datosCliente = {
    id: null as number | null,
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
    this.clienteService.getClientesPorEmpresa(this.usuario.empresa_id).subscribe({
      next: (data: any) => this.clientes = data,
      error: (err) => this.mostrarToast('Error al cargar clientes', 'error')
    });
  }

  // --- GESTIÓN DE MODALES ---

  // 1. Ver detalles
  abrirModalVer(cliente: any) {
    this.clienteSeleccionado = { ...cliente };
  }

  // 2. Crear (Reset limpio)
  abrirModalCrear() {
    this.modoEdicion = false;
    this.datosCliente = { 
        id: null, 
        nombre: '', 
        dni: '', // IMPORTANTE: String vacío, nunca null
        email: '', 
        telefono: '', 
        direccion: '' 
    };
    this.dniValido = false; 
  }

  // 3. Editar (Cargar datos)
  abrirModalEditar(cliente: any) {
    this.modoEdicion = true;
    // Usamos spread operator (...) para copiar los datos
    // Y aseguramos que si algún campo viene null de la BD, se convierta en string vacío
    this.datosCliente = { 
      ...cliente,
      dni: cliente.dni || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || ''
    }; 
    this.dniValido = true; // Al editar, asumimos válido si ya existía
  }

  // --- GUARDAR / ACTUALIZAR ---
  guardarCliente() {
    if (!this.datosCliente.nombre) {
      this.mostrarToast("El nombre es obligatorio", "warning");
      return;
    }

    const body = { ...this.datosCliente, empresa_id: this.usuario.empresa_id };

    const peticion = (this.modoEdicion && this.datosCliente.id) 
      ? this.clienteService.actualizarCliente(this.datosCliente.id, body)
      : this.clienteService.crearCliente(body);

    peticion.subscribe({
        next: () => {
            this.mostrarToast(this.modoEdicion ? "Cliente actualizado" : "Cliente creado", "success");
            this.cargarClientes();
        },
        error: (err) => {
            console.error(err);
            this.mostrarToast("Error en la operación", "error");
        }
    });
  }

  // --- VALIDACIÓN SEGURA ---
  validarDni() {
    const dni = this.datosCliente.dni;
    // Validación segura: si existe y tiene longitud
    this.dniValido = dni ? dni.length >= 8 : false;
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    this.toast = { visible: true, mensaje, tipo };
    setTimeout(() => this.toast.visible = false, 3000);
  }
}