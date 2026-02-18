<?php
namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\SolicitudModel;
use App\Models\UsuarioModel;
use App\Models\NominaModel;

class RRHH extends ResourceController {
    
    protected $format = 'json';

    // SOLO SUPERADMIN O ENCARGADO
    private function verificarPermisosRRHH($usuarioId) {
        if (!$usuarioId) return false;
        $db = \Config\Database::connect();
        $user = $db->table('usuarios')->where('id', $usuarioId)->get()->getRowArray();
        return ($user && in_array((int)$user['rol_id'], [1, 2]));
    }

    // OBTENER RESUMEN EMPLEADOS
    public function getEmpleadosResumen($empresaId = null) {
        $quienConsulta = $this->request->getGet('admin_id'); 
        if (!$this->verificarPermisosRRHH($quienConsulta)) {
            return $this->failForbidden('No tienes permisos para gestionar RRHH.');
        }

        try {
            $db = \Config\Database::connect();
            $builder = $db->table('usuarios');
            $builder->select('id, nombre, email, rol_id, dias_disponibles');
            $builder->where('empresa_id', $empresaId);
            $builder->whereIn('rol_id', [2, 3]); 
            $empleados = $builder->get()->getResultArray();

            $solicitudModel = new SolicitudModel();
            foreach ($empleados as &$emp) {
                $emp['solicitudes'] = $solicitudModel
                    ->where('usuario_id', $emp['id'])
                    ->where('estado', 'pendiente')
                    ->findAll();
            }

            return $this->respond($empleados);
        } catch (\Throwable $e) {
            return $this->failServerError('Error: ' . $e->getMessage());
        }
    }

    // ACTUALIZAR DÍAS DISPONIBLES
    public function actualizarDias() {
        $data = $this->request->getJSON(true) ?? $this->request->getPost();
        
        if (!$this->verificarPermisosRRHH($data['admin_id'] ?? null)) {
            return $this->failForbidden('Acceso denegado.');
        }

        try {
            if (empty($data['usuario_id']) || !isset($data['dias'])) {
                return $this->fail('Datos incompletos.');
            }

            $usuarioModel = new UsuarioModel();
            if ($usuarioModel->update($data['usuario_id'], ['dias_disponibles' => $data['dias']])) {
                return $this->respond(['message' => 'Días actualizados correctamente']);
            }
            return $this->failServerError('Error al actualizar días.');
        } catch (\Throwable $e) {
            return $this->failServerError($e->getMessage());
        }
    }

    // GESTION DE AUSENCIAS PARA ACPETAR O RECHAZAR
    public function gestionarAusencia() {
        $data = $this->request->getJSON(true);

        if (!$this->verificarPermisosRRHH($data['admin_id'] ?? null)) {
            return $this->failForbidden('Acceso denegado.');
        }

        try {
            $solicitudId = $data['solicitud_id'];
            $accion = $data['accion']; 

            $solicitudModel = new SolicitudModel();
            $usuarioModel = new UsuarioModel();

            $solicitud = $solicitudModel->find($solicitudId);
            if (!$solicitud) return $this->failNotFound('Solicitud no encontrada');

            if ($accion === 'aprobada') {
                $inicio = new \DateTime($solicitud['fecha_inicio']);
                $fin = new \DateTime($solicitud['fecha_fin']);
                $diasSolicitados = $fin->diff($inicio)->days + 1;

                $usuario = $usuarioModel->find($solicitud['usuario_id']);
                if ($usuario['dias_disponibles'] < $diasSolicitados) {
                    return $this->fail('Días insuficientes (' . $usuario['dias_disponibles'] . ' disponibles).');
                }

                $nuevosDias = $usuario['dias_disponibles'] - $diasSolicitados;
                $usuarioModel->update($usuario['id'], ['dias_disponibles' => $nuevosDias]);
            }

            $solicitudModel->update($solicitudId, ['estado' => $accion]);
            return $this->respond(['message' => 'Solicitud ' . $accion . ' con éxito']);

        } catch (\Throwable $e) {
            return $this->failServerError($e->getMessage());
        }
    }

    // SUBIR NÓMINA
    public function subirNomina() {
        $adminId = $this->request->getPost('admin_id');
        if (!$this->verificarPermisosRRHH($adminId)) {
            return $this->failForbidden('Acceso denegado.');
        }

        try {
            $file = $this->request->getFile('nomina');
            $usuarioId = $this->request->getPost('usuario_id');
            $mes = $this->request->getPost('mes');

            if (!$file || !$file->isValid()) return $this->fail('Archivo no válido');

            $uploadPath = FCPATH . 'uploads/nominas';
            if (!is_dir($uploadPath)) mkdir($uploadPath, 0777, true);

            $newName = $file->getRandomName();
            $file->move($uploadPath, $newName);

            $nominaModel = new NominaModel();
            $nominaModel->insert([
                'usuario_id' => $usuarioId,
                'mes' => $mes,
                'archivo' => 'uploads/nominas/' . $newName
            ]);

            return $this->respondCreated(['message' => 'Nómina procesada correctamente']);
        } catch (\Throwable $e) {
            return $this->failServerError('Error: ' . $e->getMessage());
        }
    }
}