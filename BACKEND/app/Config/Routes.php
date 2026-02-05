<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('api/login', 'Auth::login');
$routes->options('api/login', 'Auth::login');
$routes->post('empresa/crear', 'Empresa::crear');
$routes->options('empresa/crear', 'Empresa::crear');
$routes->get('dashboard', 'Dashboard::index');
$routes->post('auth/registro-empleado', 'Auth::registroEmpleado');
$routes->post('auth/registro-encargado', 'Auth::registroEncargado');
$routes->options('auth/registro-empleado', 'Auth::registroEmpleado');
$routes->get('productos/empresa/(:num)', 'Productos::getByEmpresa/$1');
$routes->get('clientes/empresa/(:num)', 'Clientes::getByEmpresa/$1');
$routes->get('clientes/detalle/(:num)', 'Clientes::getDetalle/$1');
$routes->get('personal/dashboard/(:num)', 'Personal::getDashboard/$1');
$routes->post('personal/fichar', 'Personal::fichar');



