<?php namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Categorias extends ResourceController {
    protected $format = 'json';

    // CONSEGUIR TODAS LAS CATEGORIAS
    public function index($empresaId = null) {
        $db = \Config\Database::connect();
        $cats = $db->table('categorias')
                   ->where('empresa_id', $empresaId)
                   ->get()->getResult();
        return $this->respond($cats);
    }


    public function create() {
        $json = $this->request->getJSON();
        $db = \Config\Database::connect();
        
        // REVISAR QUE NO HAYAN DUPLICADOS
        $existe = $db->table('categorias')
                     ->where('empresa_id', $json->empresa_id)
                     ->where('nombre', $json->nombre)
                     ->countAllResults();

        if ($existe > 0) {
            return $this->fail('Ya existe una categoría con este nombre.', 409);
        }

        $data = [
            'empresa_id' => $json->empresa_id,
            'nombre'     => $json->nombre,
            'descripcion'=> $json->descripcion ?? ''
        ];
        
        $db->table('categorias')->insert($data);
        return $this->respondCreated(['message' => 'Categoría creada']);
    }
}