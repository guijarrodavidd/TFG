<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UsuarioModel;
use App\Models\EmpresaModel;

class Empresa extends ResourceController {
    
    protected $modelName = 'App\Models\EmpresaModel';
    protected $format    = 'json';

    public function crear() {
        $json = $this->request->getJSON();
        
        if (!$json || !isset($json->nombre) || !isset($json->usuario_id)) {
            return $this->respond(['status' => 'error', 'message' => 'Faltan datos'], 400);
        }

        // GENERAR EL TOKEN ÚNICO DE INVITACIÓN
        // Ejemplo: "NEXUS-A1B2"
        $token = 'NEXUS-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));

        $dataEmpresa = [
            'nombre'           => $json->nombre,
            'cif'              => $json->cif ?? null,
            'direccion'        => $json->direccion ?? null,
            'telefono'         => $json->telefono ?? null,
            'token_invitacion' => $token
        ];

        $idEmpresa = $this->model->insert($dataEmpresa);

        if (!$idEmpresa) {
            return $this->respond(['status' => 'error', 'message' => 'Error al crear empresa'], 500);
        }

        $usuarioModel = new UsuarioModel();
        
        $usuarioModel->update($json->usuario_id, ['empresa_id' => $idEmpresa]);

        return $this->respond([
            'status' => 'success',
            'message' => '¡Empresa creada!',
            'data' => [
                'empresa_id' => $idEmpresa,
                'empresa_nombre' => $json->nombre,
                'token' => $token
            ]
        ]);
    }
}