import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';

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
  clientesFiltrados: any[] = [];
  
  toast = { visible: false, mensaje: '', tipo: 'success' as 'success' | 'error' | 'warning' };
  modoEdicion: boolean = false;
  
  nifValido: boolean = false; 
  mensajeErrorNif: string = '';
  clienteSeleccionado: any = null;
  datosCliente = {
    id: null as number | null,
    nombre: '',
    nif: '',
    email: '',
    telefono: '',
    direccion: ''
  };

  filtroNombre: string = '';
  filtroTipo: string = '';

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    if(!this.usuario.empresa_id) return;
    this.clienteService.getClientesPorEmpresa(this.usuario.empresa_id).subscribe({
      next: (data: any) => {
        this.clientes = data;
        this.aplicarFiltros();
      },
      error: () => this.mostrarToast('Error de conexión', 'error')
    });
  }

  aplicarFiltros() {
    this.clientesFiltrados = this.clientes.filter(cliente => {
        const coincideNombre = cliente.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
        
        let coincideTipo = true;
        if (this.filtroTipo === 'Empresa') {
            coincideTipo = /^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$/i.test(cliente.nif);
        } else if (this.filtroTipo === 'Residencial') {
            coincideTipo = !/^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$/i.test(cliente.nif);
        }

        return coincideNombre && coincideTipo;
    });
  }

  abrirModalVer(cliente: any) {
    this.clienteSeleccionado = { ...cliente };
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.datosCliente = { 
        id: null, 
        nombre: '', 
        nif: '',
        email: '', 
        telefono: '', 
        direccion: '' 
    };
    this.nifValido = false; 
    this.mensajeErrorNif = '';
  }

  abrirModalEditar(cliente: any) {
    this.modoEdicion = true;
    this.datosCliente = { 
        ...cliente, 
        nif: cliente.nif || ''
    };
    this.validarNif();
  }

  validarNif() {
    const nif = this.datosCliente.nif;
    this.mensajeErrorNif = '';

    if (!nif) {
        this.nifValido = false;
        return;
    }

    const str = nif.toUpperCase().replace(/\s/g, '').replace(/-/g, '');
    this.datosCliente.nif = str; 

    const regex = /^([ABCDEFGHJKLMNPQRSUVWXYZ]\d{7,8}|\d{8}|[XYZ]\d{7,8})([A-Z0-9])$/;
    
    if (!regex.test(str)) {
        this.nifValido = false;
        if(str.length > 0) this.mensajeErrorNif = 'Formato inválido';
        return;
    }
    
    this.nifValido = true; 
  }

  guardarCliente() {
    if (!this.datosCliente.nombre) {
      this.mostrarToast("Faltan datos obligatorios", "warning");
      return;
    }

    if (this.datosCliente.nif) {
        const duplicado = this.clientes.find(c => 
            c.nif && 
            c.nif.toUpperCase() === this.datosCliente.nif.toUpperCase() &&
            c.id !== this.datosCliente.id
        );

        if (duplicado) {
            this.mostrarToast("Ya existe un cliente con este NIF/CIF", "error");
            return;
        }
    }

    const body = { ...this.datosCliente, empresa_id: this.usuario.empresa_id };

    const peticion = (this.modoEdicion && this.datosCliente.id) 
      ? this.clienteService.actualizarCliente(this.datosCliente.id, body)
      : this.clienteService.crearCliente(body);

    peticion.subscribe({
        next: () => {
            this.mostrarToast("Guardado correctamente", "success");
            this.cargarClientes(); 
        },
        error: (err) => {
            console.error(err);
            this.mostrarToast("Error al guardar", "error");
        }
    });
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    this.toast = { visible: true, mensaje, tipo };
    setTimeout(() => this.toast.visible = false, 3000);
  }
}