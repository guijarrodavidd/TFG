<?php namespace App\Models;

use CodeIgniter\Model;

class EmpresaModel extends Model {
    protected $table = 'empresas';
    protected $primaryKey = 'id';
    
    protected $allowedFields = [
        'nombre', 'cif', 'direccion', 'telefono', 'token_invitacion'
    ];
}