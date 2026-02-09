<?php namespace App\Models;
use CodeIgniter\Model;

class ClienteModel extends Model {
    protected $table = 'clientes';
    protected $primaryKey = 'id';
    protected $allowedFields = ['empresa_id', 'nombre', 'nif', 'email', 'telefono', 'direccion', 'tipo_cliente','fecha_nacimiento', 'nacionalidad'];
}