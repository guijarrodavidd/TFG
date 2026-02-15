<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Usuarios extends ResourceController {
    protected $modelName = 'App\Models\UsuarioModel';
    protected $format    = 'json';

    // Listar empleados de la empresa
    public function getByEmpresa($empresaId = null) {
        // Excluimos al propio admin si quieres, o traemos todos
        $data = $this->model->where('empresa_id', $empresaId)->findAll();
        // Limpiamos contraseñas por seguridad
        foreach($data as &$user) unset($user['password'], $user['token_sesion']);
        return $this->respond($data);
    }

    // Crear empleado manualmente
    public function create() {
        $data = $this->request->getJSON(true);
        // Hashear password
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        $data['rol_id'] = 3; // Forzamos rol empleado
        
        if ($this->model->insert($data)) {
            return $this->respondCreated(['status' => 'success']);
        }
        return $this->fail($this->model->errors());
    }

    // Actualizar empleado
    public function update($id = null) {
        $data = $this->request->getJSON(true);
        // Si viene password, la hasheamos, si no, la quitamos para no sobrescribir vacía
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

    // Eliminar empleado
    public function delete($id = null) {
        if ($this->model->delete($id)) {
            return $this->respondDeleted(['status' => 'success']);
        }
        return $this->fail('No se pudo eliminar');
    }
}