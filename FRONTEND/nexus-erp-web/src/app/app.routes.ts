import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login'; 
import { RegistroEncargado } from './components/registro-encargado/registro-encargado';
import { RegistroEmpleado } from './components/registro-empleado/registro-empleado'; 
import { CrearEmpresaComponent } from './components/crear-empresa/crear-empresa';
import { Dashboard } from './components/dashboard/dashboard';
import { Inicio } from './components/inicio/inicio';
import { VentasComponent } from './components/ventas/ventas';
import { ProductosComponent } from './components/productos/productos';
import { ProductosCreateComponent } from './components/productos/productos-create/productos-create';
import { PersonalComponent } from './components/personal/personal';
import { ClientesComponent } from './components/clientes/clientes';

// ✅ IMPORTAR LOS NUEVOS COMPONENTES
import { InvitarComponent } from './components/invitar/invitar'; 
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios';
import { GestionRRHHComponent } from './components/gestion-rrhh/gestion-rrhh';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
    { path: 'login', component: LoginComponent },
    { path: 'registro-encargado', component: RegistroEncargado },
    { path: 'registro-empleado', component: RegistroEmpleado }, 
    { path: 'crear-empresa', component: CrearEmpresaComponent },

    // Rutas del Dashboard
    { 
        path: 'dashboard', 
        component: Dashboard,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: Inicio },
            { path: 'inicio', redirectTo: 'home' },

            { path: 'ventas', component: VentasComponent },
            { path: 'productos', component: ProductosComponent },
            { path: 'productos/nuevo', component: ProductosCreateComponent },
            { path: 'productos/editar/:id', component: ProductosCreateComponent },
            { path: 'personal', component: PersonalComponent },
            
            // ✅ ASEGÚRATE DE QUE HAY UNA COMA AL FINAL DE ESTA LÍNEA
            { path: 'clientes', component: ClientesComponent }, 

            // --- NUEVAS RUTAS (Fíjate en las comas) ---
            { path: 'usuarios', component: GestionUsuariosComponent },
            { path: 'rrhh', component: GestionRRHHComponent },
            { path: 'invitar', component: InvitarComponent } 
        ]
    }
];