<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Clientes extends ResourceController
{
    protected $modelName = 'App\Models\ClienteModel';
    protected $format    = 'json';

    // Obtener clientes por empresa
    public function getByEmpresa($empresaId = null)
    {
        $data = $this->model->where('empresa_id', $empresaId)->findAll();
        return $this->respond($data);
    }

    // Crear cliente
    public function create()
    {
        $data = $this->request->getJSON(true); // Obtener datos como array
        
        if ($this->model->insert($data)) {
            return $this->respondCreated(['status' => 'success', 'id' => $this->model->getInsertID()]);
        } else {
            return $this->fail($this->model->errors());
        }
    }

    // ✅ MÉTODO DE ACTUALIZAR (FALTABA ESTO)
    public function update($id = null)
    {
        $data = $this->request->getJSON(true);

        // Verificamos que el cliente exista
        if (!$this->model->find($id)) {
            return $this->failNotFound('Cliente no encontrado');
        }

        // Actualizamos
        if ($this->model->update($id, $data)) {
            return $this->respond(['status' => 'success', 'message' => 'Cliente actualizado']);
        } else {
            return $this->fail($this->model->errors());
        }
    }
}