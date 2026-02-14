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
  
  // Estado
  toast = { visible: false, mensaje: '', tipo: 'success' as 'success' | 'error' | 'warning' };
  modoEdicion: boolean = false;
  
  // Validación NIF
  nifValido: boolean = false; // ANTES: dniValido
  mensajeErrorNif: string = '';

  // Datos
  clienteSeleccionado: any = null;
  
  // Modelo (Cambiado dni por nif)
  datosCliente = {
    id: null as number | null,
    nombre: '',
    nif: '', // ✅ CAMBIADO
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
      error: () => this.mostrarToast('Error de conexión', 'error')
    });
  }

  // --- MODALES ---
  abrirModalVer(cliente: any) {
    this.clienteSeleccionado = { ...cliente };
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.datosCliente = { 
        id: null, 
        nombre: '', 
        nif: '', // ✅ Resetear nif
        email: '', 
        telefono: '', 
        direccion: '' 
    };
    this.nifValido = false; 
    this.mensajeErrorNif = '';
  }

  abrirModalEditar(cliente: any) {
    this.modoEdicion = true;
    // Mapeamos el campo de la BD (nif) al formulario
    this.datosCliente = { 
        ...cliente, 
        nif: cliente.nif || '' // ✅ Usamos cliente.nif
    };
    this.validarNif(); // ✅ Validar al abrir
  }

  // --- VALIDACIÓN NIF (Antes validarDni) ---
  validarNif() {
    const nif = this.datosCliente.nif;
    this.mensajeErrorNif = '';

    if (!nif) {
        this.nifValido = false;
        return;
    }

    // Normalizar
    const str = nif.toUpperCase().replace(/\s/g, '').replace(/-/g, '');
    this.datosCliente.nif = str; 

    // Formato básico (DNI, NIE, CIF básico)
    // Aceptamos X,Y,Z para NIE y letras de CIF
    const regex = /^([ABCDEFGHJKLMNPQRSUVWXYZ]\d{7,8}|\d{8}|[XYZ]\d{7,8})([A-Z0-9])$/;
    
    if (!regex.test(str)) {
        this.nifValido = false;
        if(str.length > 0) this.mensajeErrorNif = 'Formato inválido';
        return;
    }

    // Nota: Aquí podrías mantener el algoritmo del módulo 23 si es solo para DNI/NIE.
    // Si aceptas CIF (empresas), el algoritmo es más complejo.
    // Para simplificar y que no te falle con empresas, validaremos solo formato y longitud por ahora.
    
    this.nifValido = true; // Asumimos válido si pasa el regex
  }

  guardarCliente() {
    if (!this.datosCliente.nombre) {
      this.mostrarToast("Faltan datos obligatorios", "warning");
      return;
    }

    // El objeto ya lleva la propiedad 'nif' correcta
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