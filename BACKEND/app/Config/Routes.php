<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

$routes->get('/', 'Home::index');

// GRUPO DE RUTAS API
$routes->group('api', function($routes) {

    // --- AUTENTICACIÓN ---
    $routes->post('login', 'Auth::login');
    $routes->options('login', 'Auth::login'); // Para CORS
    $routes->post('registro-encargado', 'Auth::registroEncargado');
    $routes->post('registro-empleado', 'Auth::registroEmpleado');
    $routes->options('registro-empleado', 'Auth::registroEmpleado');

    // --- EMPRESAS ---
    $routes->post('empresas/crear', 'Empresa::crear');
    $routes->options('empresas/crear', 'Empresa::crear');

    // --- PRODUCTOS ---
    $routes->get('productos/empresa/(:num)', 'Productos::index/$1');
    $routes->get('productos/(:num)', 'Productos::show/$1');
    $routes->post('productos/crear', 'Productos::create');
    $routes->post('productos/actualizar/(:num)', 'Productos::update/$1');

    // --- CATEGORÍAS ---
    $routes->get('categorias/empresa/(:num)', 'Categorias::index/$1');
    $routes->post('categorias/crear', 'Categorias::create');

    // --- CLIENTES ---
    $routes->get('clientes/empresa/(:num)', 'Clientes::getByEmpresa/$1');
    $routes->get('clientes/detalle/(:num)', 'Clientes::getDetalle/$1');
    $routes->post('clientes/crear', 'Clientes::create');

    // --- PERSONAL / RRHH ---
    $routes->get('personal/dashboard/(:num)', 'Personal::getDashboard/$1');
    $routes->get('personal/solicitudes/(:num)', 'Personal::getSolicitudes/$1');
    $routes->post('personal/fichar', 'Personal::fichar');
    $routes->post('personal/solicitar-vacaciones', 'Personal::solicitarVacaciones');

    // --- OTROS ---
    $routes->get('dashboard', 'Dashboard::index');
});