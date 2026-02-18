<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Personal extends ResourceController {
    
    protected $format = 'json';

    public function getDashboard($userId = null) {
        $db = \Config\Database::connect();

        $usuario = $db->table('usuarios')
                      ->select('usuarios.id, usuarios.nombre, usuarios.email, usuarios.dias_disponibles, usuarios.empresa_id, empresas.nombre as empresa_nombre')
                      ->join('empresas', 'empresas.id = usuarios.empresa_id', 'left')
                      ->where('usuarios.id', $userId)
                      ->get()->getRowArray();

        if (!$usuario) return $this->failNotFound('Usuario no encontrado');

        // FICHAJES
        $fichajes = $db->table('fichajes')
                       ->where('usuario_id', $userId)
                       ->orderBy('entrada', 'DESC')
                       ->get()->getResultArray();

        // ESTADO ACTUAL DE FICHAJE
        $fichajeActivo = $db->table('fichajes')
                            ->where('usuario_id', $userId)
                            ->where('salida', null)
                            ->orderBy('entrada', 'DESC')
                            ->get()->getRowArray();

        // NÓMINAS
        $nominas = $db->table('nominas')
                      ->where('usuario_id', $userId)
                      ->orderBy('created_at', 'DESC')
                      ->get()->getResultArray();

        foreach ($nominas as &$n) {
            $rutaBase = str_replace('index.php', '', base_url());
            if (strpos($rutaBase, 'BACKEND') === false) {
                $rutaBase = 'https://davidguijarro.com.es/tfg/BACKEND/public/';
            }
            $n['url_descarga'] = $rutaBase . $n['archivo'];
        }

        $solicitudes = $db->table('solicitudes_ausencia')
                          ->where('usuario_id', $userId)
                          ->orderBy('created_at', 'DESC')
                          ->get()->getResultArray();

        return $this->respond([
            'usuario' => $usuario,
            'fichajes' => $fichajes,
            'fichaje_activo' => $fichajeActivo,
            'nominas' => $nominas,
            'solicitudes' => $solicitudes
        ]);
    }

    // FICHAJE
    public function fichar() {
        $data = $this->request->getJSON(true);
        $usuarioId = $data['usuario_id'];
        $empresaId = $data['empresa_id'];

        $db = \Config\Database::connect();
        $builder = $db->table('fichajes');

        $abierto = $builder->where('usuario_id', $usuarioId)
                           ->where('salida', null)
                           ->get()->getRowArray();

        if ($abierto) {
            // CERRAR TURNO
            $builder->where('id', $abierto['id'])->update(['salida' => date('Y-m-d H:i:s')]);
            return $this->respond(['status' => 'success', 'tipo' => 'salida']);
        } else {
            // ABRIR TURNO
            $builder->insert([
                'usuario_id' => $usuarioId, 
                'empresa_id' => $empresaId, 
                'entrada' => date('Y-m-d H:i:s')
            ]);
            return $this->respond(['status' => 'success', 'tipo' => 'entrada']);
        }
    }

    public function solicitarVacaciones() {
        $data = $this->request->getJSON(true);
        $db = \Config\Database::connect();
        $db->table('solicitudes_ausencia')->insert([
            'usuario_id' => $data['usuario_id'],
            'empresa_id' => $data['empresa_id'],
            'fecha_inicio' => $data['fecha_inicio'],
            'fecha_fin' => $data['fecha_fin'],
            'tipo' => $data['tipo'],
            'comentarios' => $data['comentarios'],
            'estado' => 'pendiente'
        ]);
        return $this->respondCreated(['message' => 'Solicitud enviada']);
    }
}