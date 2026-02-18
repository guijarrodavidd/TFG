<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

$routes->get('/', 'Home::index');

$routes->group('api', ['filter' => 'cors'], function($routes) {

    $routes->post('auth/login', 'Auth::login');
    $routes->options('auth/login', 'Auth::login'); 
    
    $routes->post('auth/registro-encargado', 'Auth::registroEncargado');
    
    $routes->post('auth/registro-empleado', 'Auth::registroEmpleado');
    $routes->options('auth/registro-empleado', 'Auth::registroEmpleado');

    $routes->post('empresas/crear', 'Empresa::crear');
    $routes->options('empresas/crear', 'Empresa::crear');

    $routes->get('productos/empresa/(:num)', 'Productos::index/$1');
    $routes->get('productos/(:num)', 'Productos::show/$1');
    $routes->post('productos/crear', 'Productos::create');
    $routes->post('productos/actualizar/(:num)', 'Productos::update/$1');
    $routes->get('productos/ver/(:num)', 'Productos::getProductoById/$1');
    $routes->post('productos/actualizar/(:num)', 'Productos::updateProducto/$1');
    $routes->delete('productos/borrar/(:num)', 'Productos::borrarProducto/$1');

    $routes->post('ventas/crear', 'Ventas::create');
    $routes->options('ventas/crear', 'Ventas::create');

    $routes->get('categorias/empresa/(:num)', 'Categorias::index/$1');
    $routes->post('categorias/crear', 'Categorias::create');

    $routes->get('clientes/empresa/(:num)', 'Clientes::getByEmpresa/$1');
    $routes->get('clientes/detalle/(:num)', 'Clientes::getDetalle/$1');
    $routes->post('clientes/actualizar/(:num)', 'Clientes::update/$1');
    $routes->post('clientes/crear', 'Clientes::create');

    $routes->get('personal/dashboard/(:num)', 'Personal::getDashboard/$1');
    $routes->get('personal/solicitudes/(:num)', 'Personal::getSolicitudes/$1');
    $routes->post('personal/fichar', 'Personal::fichar');
    $routes->post('personal/solicitar-vacaciones', 'Personal::solicitarVacaciones');

    $routes->get('dashboard', 'Dashboard::index');
    $routes->get('dashboard/resumen/(:num)', 'Dashboard::index/$1');
    $routes->get('usuarios/empresa/(:num)', 'Usuarios::getByEmpresa/$1');
    $routes->post('usuarios/crear', 'Usuarios::create');
    $routes->post('usuarios/actualizar/(:num)', 'Usuarios::update/$1');
    $routes->delete('usuarios/eliminar/(:num)', 'Usuarios::delete/$1');

    $routes->get('rrhh/empleados/(:num)', 'RRHH::getEmpleadosResumen/$1');
    $routes->post('rrhh/subir-nomina', 'RRHH::subirNomina');
    $routes->post('rrhh/gestionar-ausencia', 'RRHH::gestionarAusencia');
    $routes->post('rrhh/actualizar-dias', 'RRHH::actualizarDias');

    $routes->get('admin/empresas/(:num)', 'Admin::index/$1');
    $routes->post('admin/guardar-empresa', 'Admin::guardarEmpresa');
    $routes->delete('admin/borrar-empresa/(:num)/(:num)', 'Admin::borrarEmpresa/$1/$2');
    $routes->post('admin/crear-usuario', 'Admin::crearUsuario');
    $routes->delete('admin/borrar-usuario/(:num)/(:num)', 'Admin::borrarUsuario/$1/$2');
    
    $routes->options('(:any)', function() {});
});