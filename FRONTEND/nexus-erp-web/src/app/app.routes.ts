import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login'; 
import { RegistroEncargado } from './components/registro-encargado/registro-encargado';
import { CrearEmpresaComponent } from './components/crear-empresa/crear-empresa';
import { RegistroEmpleado } from './components/registro-empleado/registro-empleado';
import { Dashboard } from './components/dashboard/dashboard';
import { Inicio } from './components/inicio/inicio';
import { VentasComponent } from './components/ventas/ventas';
import { ProductosComponent } from './components/productos/productos';
import { ProductosCreateComponent } from './components/productos/productos-create/productos-create';
import { PersonalComponent } from './components/personal/personal';
import { ClientesComponent } from './components/clientes/clientes';

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
            
            // ✅ SOLUCIÓN RUTA: Definimos 'home' y añadimos 'inicio' como alias
            { path: 'home', component: Inicio },
            { path: 'inicio', redirectTo: 'home' }, // Si alguien va a /inicio, lo manda a /home

            { path: 'ventas', component: VentasComponent },
            { path: 'productos', component: ProductosComponent },
            { path: 'productos/nuevo', component: ProductosCreateComponent },
            { path: 'productos/editar/:id', component: ProductosCreateComponent },
            { path: 'personal', component: PersonalComponent },
            { path: 'clientes', component: ClientesComponent }
        ]
    }
];