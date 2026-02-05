<?php namespace App\Models;

use CodeIgniter\Model;

class ProductoModel extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'id';
    protected $allowedFields = ['empresa_id', 'nombre', 'descripcion', 'precio', 'categoria', 'imagen', 'rating', 'color', 'stock'];
}