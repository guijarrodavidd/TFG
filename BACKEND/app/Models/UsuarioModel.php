<?php

namespace App\Models;

use CodeIgniter\Model;

class UsuarioModel extends Model
{
    protected $table            = 'usuarios';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    
    // ✅ CORRECCIÓN: Añadimos todos los campos, especialmente 'token_sesion'
    protected $allowedFields    = [
        'nombre', 
        'email', 
        'password', 
        'rol_id', 
        'empresa_id', 
        'token_sesion', // <--- IMPORTANTE: Si esto falta, el login da Error 500
        'created_at',
        'dias_disponibles'
    ];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Reglas de validación base
    protected $validationRules = [
        'email'    => 'required|valid_email|is_unique[usuarios.email,id,{id}]',
        'nombre'   => 'required|min_length[3]'
    ];
}