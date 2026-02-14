<?php

namespace App\Models;

use CodeIgniter\Model;

class ClienteModel extends Model
{
    protected $table            = 'clientes';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    
    // ✅ CORRECCIÓN: AÑADIMOS 'dni' AQUI. SI NO ESTÁ, NO SE GUARDA.
    protected $allowedFields    = ['nombre', 'nif', 'email', 'telefono', 'direccion', 'empresa_id'];

    // Validaciones
    protected $validationRules = [
        'nombre'     => 'required|min_length[3]',
        'empresa_id' => 'required|integer',
        // 'dni'     => 'permit_empty' // Opcional: puedes añadir reglas aquí si quieres forzarlo
    ];
}