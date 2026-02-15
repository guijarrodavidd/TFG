<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Cors extends BaseConfig
{
    /**
     * Configuración CORS para permitir conexión con Angular
     */
    public array $default = [
        'allowedOrigins'         => ['http://davidguijarro.com.es/'], // Tu frontend
        'allowedOriginsPatterns' => [],
        'supportsCredentials'    => true,
        'allowedHeaders'         => ['*'], // Permitir todos los headers
        'allowedMethods'         => ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
        'exposedHeaders'         => [],
        'maxAge'                 => 7200,
    ];
}