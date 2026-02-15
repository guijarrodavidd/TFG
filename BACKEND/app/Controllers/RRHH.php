<?php
namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\SolicitudModel;
use App\Models\UsuarioModel;
use App\Models\NominaModel;

class RRHH extends ResourceController {
    
    protected $format = 'json';

    // 1. OBTENER RESUMEN EMPLEADOS
    public function getEmpleadosResumen($empresaId = null) {
        try {
            $db = \Config\Database::connect();
            
            // Obtener empleados y encargados
            $builder = $db->table('usuarios');
            $builder->select('id, nombre, email, rol_id, dias_disponibles');
            $builder->where('empresa_id', $empresaId);
            $builder->whereIn('rol_id', [2, 3]); 
            $empleados = $builder->get()->getResultArray();

            // Inyectar solicitudes pendientes
            $solicitudModel = new SolicitudModel();
            
            foreach ($empleados as &$emp) {
                $emp['solicitudes'] = $solicitudModel
                    ->where('usuario_id', $emp['id'])
                    ->where('estado', 'pendiente')
                    ->findAll();
            }

            return $this->respond($empleados);
        } catch (\Throwable $e) {
            return $this->failServerError('Error cargando empleados: ' . $e->getMessage());
        }
    }

    // 2. ACTUALIZAR DÍAS DISPONIBLES
    public function actualizarDias() {
        try {
            // Intentamos obtener JSON, si falla, intentamos POST normal
            $data = $this->request->getJSON(true) ?? $this->request->getPost();

            // Validación manual de datos
            if (empty($data['usuario_id']) || !isset($data['dias'])) {
                return $this->fail('Faltan datos obligatorios (usuario_id o dias). Recibido: ' . json_encode($data));
            }

            $usuarioModel = new UsuarioModel();
            
            // Verificamos si el usuario existe antes de actualizar
            $user = $usuarioModel->find($data['usuario_id']);
            if (!$user) {
                return $this->failNotFound('Usuario no encontrado');
            }

            // Actualizamos
            if ($usuarioModel->update($data['usuario_id'], ['dias_disponibles' => $data['dias']])) {
                return $this->respond(['message' => 'Días actualizados correctamente']);
            }
            
            return $this->failServerError('Error en base de datos al actualizar.');

        } catch (\Throwable $e) {
            // Esto imprimirá el error real en tu consola del navegador (Pestaña Red/Network)
            return $this->failServerError('Excepción del servidor: ' . $e->getMessage());
        }
    }

    // 3. GESTIONAR AUSENCIA (APROBAR/RECHAZAR)
    public function gestionarAusencia() {
        try {
            $data = $this->request->getJSON(true);
            
            if (empty($data['solicitud_id']) || empty($data['accion'])) {
                return $this->fail('Datos incompletos para gestionar ausencia.');
            }

            $solicitudId = $data['solicitud_id'];
            $accion = $data['accion']; 

            $solicitudModel = new SolicitudModel();
            $usuarioModel = new UsuarioModel();

            $solicitud = $solicitudModel->find($solicitudId);
            if (!$solicitud) return $this->failNotFound('Solicitud no encontrada');

            // Lógica de aprobación (Resta de días)
            if ($accion === 'aprobada') {
                $inicio = new \DateTime($solicitud['fecha_inicio']);
                $fin = new \DateTime($solicitud['fecha_fin']);
                $diasSolicitados = $fin->diff($inicio)->days + 1;

                $usuario = $usuarioModel->find($solicitud['usuario_id']);
                
                // Comprobación de seguridad
                if (!$usuario) return $this->failNotFound('Usuario de la solicitud no existe');

                if ($usuario['dias_disponibles'] < $diasSolicitados) {
                    return $this->fail('El empleado no tiene suficientes días disponibles (' . $usuario['dias_disponibles'] . ' vs ' . $diasSolicitados . ').');
                }

                $nuevosDias = $usuario['dias_disponibles'] - $diasSolicitados;
                $usuarioModel->update($usuario['id'], ['dias_disponibles' => $nuevosDias]);
            }

            $solicitudModel->update($solicitudId, ['estado' => $accion]);

            return $this->respond(['message' => 'Solicitud ' . $accion]);

        } catch (\Throwable $e) {
            return $this->failServerError($e->getMessage());
        }
    }

    // 4. SUBIR NÓMINA
    public function subirNomina() {
        try {
            $file = $this->request->getFile('nomina');
            $usuarioId = $this->request->getPost('usuario_id');
            $mes = $this->request->getPost('mes');

            if (!$file || !$file->isValid()) {
                return $this->fail($file ? $file->getErrorString() : 'No se ha enviado archivo');
            }

            // Ruta absoluta a la carpeta pública
            $uploadPath = FCPATH . 'uploads/nominas'; // FCPATH apunta a /public/

            // ✅ CRÍTICO: Crear carpeta si no existe (Recursivo)
            if (!is_dir($uploadPath)) {
                if (!mkdir($uploadPath, 0777, true)) {
                    return $this->failServerError('No se pudo crear la carpeta de destino: ' . $uploadPath);
                }
            }

            $newName = $file->getRandomName();
            
            if (!$file->move($uploadPath, $newName)) {
                return $this->failServerError('Falló al mover el archivo');
            }

            $nominaModel = new NominaModel();
            $nominaModel->insert([
                'usuario_id' => $usuarioId,
                'mes' => $mes,
                'archivo' => 'uploads/nominas/' . $newName
            ]);

            return $this->respondCreated(['message' => 'Nómina subida correctamente']);

        } catch (\Throwable $e) {
            return $this->failServerError('Error fatal subiendo nómina: ' . $e->getMessage());
        }
    }
}