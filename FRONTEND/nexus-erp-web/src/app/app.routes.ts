import { Routes } from '@angular/router';

// 1. CORREGIR LOS IMPORTS (Añadir 'Component' al final)
import { LoginComponent } from './components/login/login'; 
import { RegistroEncargado } from './components/registro-encargado/registro-encargado';
import { CrearEmpresaComponent } from './components/crear-empresa/crear-empresa';
import { RegistroEmpleado } from './components/registro-empleado/registro-empleado';

// Import del Dashboard y sus hijos
import { Dashboard } from './components/dashboard/dashboard';
import { Inicio } from './components/inicio/inicio';
import { VentasComponent } from './components/ventas/ventas';
import { ProductosComponent } from './components/productos/productos';
import { ProductosCreateComponent } from './components/productos/productos-create/productos-create';
import { PersonalComponent } from './components/personal/personal';
import { ClientesComponent } from './components/clientes/clientes';

// (Asegúrate de que AuthGuard esté importado si lo usas)
// import { AuthGuard } from './guards/auth.guard'; 

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
    // 2. ACTUALIZAR LOS COMPONENTES EN LAS RUTAS
    { path: 'login', component: LoginComponent },
    { path: 'registro-encargado', component: RegistroEncargado }, // Este parece que se llamaba así (sin Component) en tu código anterior
    { path: 'registro-empleado', component: RegistroEmpleado },
    { path: 'crear-empresa', component: CrearEmpresaComponent },

    // Rutas del Dashboard
    { 
        path: 'dashboard', 
        component: Dashboard,
        // canActivate: [AuthGuard], // Recomendado descomentar cuando tengas el Guard
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: Inicio },
            { path: 'ventas', component: VentasComponent },
            
            // Rutas de Productos
            { path: 'productos', component: ProductosComponent },
            { path: 'productos/nuevo', component: ProductosCreateComponent },
            { path: 'productos/editar/:id', component: ProductosCreateComponent },

            { path: 'personal', component: PersonalComponent },
            { path: 'clientes', component: ClientesComponent }
        ]
    }
];