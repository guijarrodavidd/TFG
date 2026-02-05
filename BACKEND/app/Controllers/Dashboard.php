<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UsuarioModel;
use App\Models\EmpresaModel;

class Dashboard extends ResourceController {
    
    protected $format = 'json';

    public function index() {
        
        $usuario_id = $this->request->getGet('usuario_id');

        if (!$usuario_id) {
            return $this->respond(['status' => 'error', 'message' => 'Falta ID usuario'], 400);
        }

        $usuarioModel = new UsuarioModel();
        $empresaModel = new EmpresaModel();

        $usuario = $usuarioModel->find($usuario_id);

        if (!$usuario || !$usuario['empresa_id']) {
             return $this->respond(['status' => 'error', 'message' => 'Usuario sin empresa'], 404);
        }

        $empresa = $empresaModel->find($usuario['empresa_id']);

        return $this->respond([
            'status' => 'success',
            'data' => [
                'usuario_nombre' => $usuario['nombre'],
                'rol' => $usuario['rol_id'],
                'empresa' => [
                    'nombre' => $empresa['nombre'],
                    'cif' => $empresa['cif'],
                    'token' => $empresa['token_invitacion']
                ]
            ]
        ]);
    }
}