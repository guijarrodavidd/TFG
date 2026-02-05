<?php namespace App\Models;
use CodeIgniter\Model;

class VentaModel extends Model {
    protected $table = 'ventas';
    protected $primaryKey = 'id';
    protected $allowedFields = ['empresa_id', 'cliente_id', 'codigo_transaccion', 'producto', 'cantidad', 'fecha_venta', 'total'];
}