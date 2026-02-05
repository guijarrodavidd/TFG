<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Productos extends ResourceController
{
    protected $modelName = 'App\Models\ProductoModel';
    protected $format    = 'json';

    // Obtener productos de una empresa específica
    public function getByEmpresa($empresaId = null)
    {
        if (!$empresaId) return $this->fail('Falta el ID de empresa');
        
        $productos = $this->model->where('empresa_id', $empresaId)->findAll();
        
        return $this->respond($productos);
    }
}