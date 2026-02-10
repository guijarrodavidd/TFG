import { Routes } from '@angular/router';

// Asegúrate de que las rutas de importación coincidan con tus archivos. 
// Angular suele añadir '.component' al nombre del archivo y de la clase.

import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard'; // El Layout con Sidebar
import { CrearEmpresa } from './components/crear-empresa/crear-empresa';
import { Inicio } from './components/inicio/inicio'; // El contenido de gráficos
import { RegistroEmpleado } from './components/registro-empleado/registro-empleado';
import { RegistroEncargado } from './components/registro-encargado/registro-encargado';
import { ProductosComponent } from './components/productos/productos'; // Importar
import { ClientesComponent } from './components/clientes/clientes';
import { PersonalComponent } from './components/personal/personal';
import { ProductosCreateComponent } from './components/productos/productos-create/productos-create';
import { VentasComponent } from './components/ventas/ventas';

export const routes: Routes = [
    // --- RUTAS PÚBLICAS (Sin Sidebar) ---
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'registro', component: RegistroEmpleado },
    { path: 'registro-jefe', component: RegistroEncargado },
    { path: 'crear-empresa', component: CrearEmpresa }, // Asistente inicial, sin sidebar aún

    // --- RUTAS PRIVADAS (Layout Dashboard con Sidebar) ---
    { 
        path: 'dashboard', 
        component: Dashboard, // Este componente tiene el <app-sidebar> y el <router-outlet>
        children: [
            // Cuando entras a /dashboard, te manda a /dashboard/inicio automáticamente
            { path: '', redirectTo: 'inicio', pathMatch: 'full' },
            
            // Aquí se carga el componente Inicio dentro del hueco derecho del Dashboard
            { path: 'inicio', component: Inicio },
            { path: 'productos', component: ProductosComponent },
            { path: 'clientes', component: ClientesComponent },
            { path: 'personal', component: PersonalComponent },
            { path: 'productos', component: ProductosComponent },
            { path: 'productos/crear', component: ProductosCreateComponent },
            { path: 'productos/editar/:id', component: ProductosCreateComponent },
            { path: 'ventas', component: VentasComponent },
            
            // Futuras rutas (ejemplo):
            // { path: 'clientes', component: ClientesComponent },
            // { path: 'ventas', component: VentasComponent },
        ]
    },
    
    // Ruta comodín (opcional): si ponen una URL rara, volver al login
    { path: '**', redirectTo: 'login' }
];