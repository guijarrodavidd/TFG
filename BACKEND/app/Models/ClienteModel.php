<?php

namespace App\Models;

use CodeIgniter\Model;

class ClienteModel extends Model
{
    protected $table            = 'clientes';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    
    protected $allowedFields    = ['nombre', 'nif', 'email', 'telefono', 'direccion', 'empresa_id'];

    protected $validationRules = [
        'nombre'     => 'required|min_length[3]',
        'empresa_id' => 'required|integer',
    ];
}