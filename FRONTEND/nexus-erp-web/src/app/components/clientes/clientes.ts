import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {
  
  http = inject(HttpClient);
  usuario: any = {};
  vista: 'lista' | 'detalle' | 'crear' = 'lista';
  
  clientes: any[] = [];
  clienteSeleccionado: any = {};
  comprasCliente: any[] = [];

  // Objeto para el formulario
  nuevoCliente = {
    nombre: '',
    nif: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo_cliente: 'Residencial',
    fecha_nacimiento: '',
    nacionalidad: 'España'
  };

  // ESTADO DE VALIDACIÓN DNI
  dniValido: boolean = true;
  mensajeDni: string = '';

  // SISTEMA DE NOTIFICACIONES (TOAST)
  toast = {
    visible: false,
    mensaje: '',
    tipo: 'success' // 'success' o 'error'
  };

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuario = JSON.parse(data);
      this.cargarClientes();
    }
  }

  cargarClientes() {
    const idEmpresa = this.usuario.empresa_id;
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/clientes/empresa/${idEmpresa}`)
      .subscribe((res: any) => this.clientes = res);
  }

  verDetalle(cliente: any) {
    this.http.get(`http://localhost/TFG/BACKEND/public/index.php/clientes/detalle/${cliente.id}`)
      .subscribe((res: any) => {
        this.clienteSeleccionado = res.cliente;
        this.comprasCliente = res.compras;
        this.vista = 'detalle';
      });
  }

  // --- MÉTODOS NUEVOS ---

  mostrarFormulario() {
    this.nuevoCliente = {
      nombre: '', nif: '', email: '', telefono: '', direccion: '', 
      tipo_cliente: 'Residencial', fecha_nacimiento: '', nacionalidad: 'España'
    };
    this.dniValido = true;
    this.mensajeDni = '';
    this.vista = 'crear';
  }
  esMenorDeEdad(fecha: string): boolean {
    if (!fecha) return false;
    
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    // Ajustar si aún no ha cumplido años este mes
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad < 18;
  }

  // --- 1. LÓGICA VALIDACIÓN DNI/NIE ---
  validarDNI() {
    let valor = this.nuevoCliente.nif.toUpperCase();
    
    // Regex básica para formato (8 números + Letra  O  Letra + 7 números + Letra)
    const validFormat = /^[XYZ]?\d{5,8}[A-Z]$/;

    if (!validFormat.test(valor)) {
      this.dniValido = false;
      this.mensajeDni = 'Formato incorrecto';
      return;
    }

    // Algoritmo para NIE: Sustituir X,Y,Z por 0,1,2
    let numeroStr = valor;
    numeroStr = numeroStr.replace('X', '0').replace('Y', '1').replace('Z', '2');

    // Separar número y letra
    const numero = parseInt(numeroStr.slice(0, -1)); // Todo menos el último
    const letraInput = valor.slice(-1); // El último carácter

    // La fórmula mágica del Ministerio del Interior
    const letrasValidas = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const letraCalculada = letrasValidas[numero % 23];

    if (letraCalculada === letraInput) {
      this.dniValido = true;
      this.mensajeDni = '';
    } else {
      this.dniValido = false;
      this.mensajeDni = `La letra no coincide (Debería ser ${letraCalculada})`;
    }
  }

  // --- 2. LÓGICA NOTIFICACIONES ---
  mostrarToast(mensaje: string, tipo: 'success' | 'error') {
    this.toast.mensaje = mensaje;
    this.toast.tipo = tipo;
    this.toast.visible = true;

    // Ocultar automáticamente a los 3 segundos
    setTimeout(() => {
      this.toast.visible = false;
    }, 3000);
  }

  guardarCliente() {
    // Validación previa
    if (!this.dniValido || !this.nuevoCliente.nif) {
      this.mostrarToast('Revisa el DNI antes de guardar', 'error');
      return;
    }

    if (!this.nuevoCliente.nombre) {
      this.mostrarToast('El nombre es obligatorio', 'error');
      return;
    }

    const datosEnviar = {
      ...this.nuevoCliente,
      empresa_id: this.usuario.empresa_id
    };

    this.http.post('http://localhost/TFG/BACKEND/public/index.php/clientes/crear', datosEnviar)
      .subscribe({
        next: () => {
          this.mostrarToast('Cliente creado correctamente', 'success');
          this.cargarClientes();
          
          // Esperamos un poquito para volver a la lista y que se vea el mensaje
          setTimeout(() => {
            this.vista = 'lista';
          }, 1000);
        },
        error: (err) => {
          console.error(err);
          this.mostrarToast('Error al conectar con el servidor', 'error');
        }
      });
  }
  
  volver() { this.vista = 'lista'; }
}