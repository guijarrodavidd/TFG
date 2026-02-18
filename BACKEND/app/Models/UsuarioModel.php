<?php

namespace App\Models;

use CodeIgniter\Model;

class UsuarioModel extends Model
{
    protected $table            = 'usuarios';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    
    protected $allowedFields    = [
        'nombre', 
        'email', 
        'password', 
        'rol_id', 
        'empresa_id', 
        'token_sesion',
        'created_at',
        'dias_disponibles'
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $validationRules = [
        'email'    => 'required|valid_email|is_unique[usuarios.email,id,{id}]',
        'nombre'   => 'required|min_length[3]'
    ];
}