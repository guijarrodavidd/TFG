<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Usuarios extends ResourceController {
    protected $modelName = 'App\Models\UsuarioModel';
    protected $format    = 'json';

    // LISTAR EMPLEADOS
    public function getByEmpresa($empresaId = null) {
        $data = $this->model->where('empresa_id', $empresaId)->findAll();
        foreach($data as &$user) unset($user['password'], $user['token_sesion']);
        return $this->respond($data);
    }

    // CREAR EMPLEADO
    public function create() {
        $data = $this->request->getJSON(true);
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        $data['rol_id'] = 3; // SE AUTOASIGNA EMPLEADO
        
        if ($this->model->insert($data)) {
            return $this->respondCreated(['status' => 'success']);
        }
        return $this->fail($this->model->errors());
    }

    // ACTUALIZAR EMPLEADO
    public function update($id = null) {
        $data = $this->request->getJSON(true);
        if (!empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        } else {
            unset($data['password']);
        }
        
        if ($this->model->update($id, $data)) {
            return $this->respond(['status' => 'success']);
        }
        return $this->fail($this->model->errors());
    }

    // ELIMINAR EMPLEADO
    public function delete($id = null) {
        if ($this->model->delete($id)) {
            return $this->respondDeleted(['status' => 'success']);
        }
        return $this->fail('No se pudo eliminar');
    }
}