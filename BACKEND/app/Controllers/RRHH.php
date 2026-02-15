<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class RRHH extends ResourceController {
    
    // Obtener empleados con sus solicitudes pendientes
    public function getEmpleadosResumen($empresaId = null) {
        $db = \Config\Database::connect();
        
        // 1. Obtener usuarios
        $builder = $db->table('usuarios');
        $builder->select('id, nombre, email, rol_id');
        $builder->where('empresa_id', $empresaId);
        $builder->where('rol_id', 3); // Solo empleados
        $empleados = $builder->get()->getResultArray();

        // 2. Para cada empleado, buscar solicitudes pendientes (Mock rápido)
        // Aquí deberías conectar con tu tabla de solicitudes real
        return $this->respond($empleados);
    }

    public function subirNomina() {
        $file = $this->request->getFile('nomina');
        $usuarioId = $this->request->getPost('usuario_id');
        $mes = $this->request->getPost('mes');

        if (!$file->isValid()) return $this->fail($file->getErrorString());

        // Mover archivo
        $newName = $file->getRandomName();
        $file->move(ROOTPATH . 'public/uploads/nominas', $newName);

        $nominaModel = new \App\Models\NominaModel();
        $nominaModel->insert([
            'usuario_id' => $usuarioId,
            'mes' => $mes,
            'archivo' => 'uploads/nominas/' . $newName
        ]);

        return $this->respondCreated(['message' => 'Nómina subida']);
    }

    // Aprobar/Rechazar vacaciones (Necesita tabla solicitudes)
    public function gestionarAusencia() {
        // Implementar lógica de update sobre tabla solicitudes
        return $this->respond(['message' => 'Estado actualizado']);
    }
}