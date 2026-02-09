<?php namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Categorias extends ResourceController {
    protected $format = 'json';

    // Obtener todas las categorías de una empresa
    public function index($empresaId = null) {
        $db = \Config\Database::connect();
        $cats = $db->table('categorias')
                   ->where('empresa_id', $empresaId)
                   ->get()->getResult();
        return $this->respond($cats);
    }

    // Crear categoría
    public function create() {
        $json = $this->request->getJSON();
        $db = \Config\Database::connect();
        
        $data = [
            'empresa_id' => $json->empresa_id,
            'nombre'     => $json->nombre,
            'descripcion'=> $json->descripcion ?? ''
        ];
        
        $db->table('categorias')->insert($data);
        return $this->respondCreated(['message' => 'Categoría creada']);
    }
}