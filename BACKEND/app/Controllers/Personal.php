<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\I18n\Time;

class Personal extends ResourceController {
    
    protected $format = 'json';

    // -------------------------------------------------------------------------
    // 1. DASHBOARD COMPLETO (Usuario + Nóminas + Solicitudes)
    // -------------------------------------------------------------------------
    public function getDashboard($userId = null) {
        $db = \Config\Database::connect();

        // 1. Usuario
        $usuario = $db->table('usuarios')
                      ->select('id, nombre, email, dias_disponibles')
                      ->where('id', $userId)
                      ->get()->getRowArray();

        // 2. Historial de Fichajes
        $fichajes = $db->table('fichajes')
                       ->where('usuario_id', $userId)
                       ->orderBy('entrada', 'DESC')
                       ->limit(10)
                       ->get()->getResultArray();

        // 3. Estado actual (CRÍTICO PARA EL CRONÓMETRO)
        // Buscamos la fila completa, NO un booleano
        $fichajeActivo = $db->table('fichajes')
                            ->where('usuario_id', $userId)
                            ->where('salida', null)
                            ->orderBy('entrada', 'DESC')
                            ->get()->getRowArray();

        // 4. Nóminas y Solicitudes
        $nominas = $db->table('nominas')->where('usuario_id', $userId)->orderBy('created_at', 'DESC')->get()->getResultArray();
        foreach ($nominas as &$n) $n['url_descarga'] = base_url($n['archivo']);

        $solicitudes = $db->table('solicitudes_ausencia')->where('usuario_id', $userId)->orderBy('created_at', 'DESC')->get()->getResultArray();

        return $this->respond([
            'usuario' => $usuario,
            'fichajes' => $fichajes,
            'fichaje_activo' => $fichajeActivo, // <--- ¡AQUÍ ESTÁ LA CLAVE! Tiene que ser la variable, no true/false
            'nominas' => $nominas,
            'solicitudes' => $solicitudes
        ]);
    }

    // -------------------------------------------------------------------------
    // 2. FICHAR (ENTRADA / SALIDA) - RECUPERADO
    // -------------------------------------------------------------------------
    public function fichar() {
        $data = $this->request->getJSON(true);
        $usuarioId = $data['usuario_id'];
        $db = \Config\Database::connect();
        $builder = $db->table('fichajes');

        // Buscar turno abierto
        $abierto = $builder->where('usuario_id', $usuarioId)->where('salida', null)->get()->getRowArray();

        if ($abierto) {
            // CERRAR
            $builder->where('id', $abierto['id'])->update(['salida' => date('Y-m-d H:i:s')]);
            return $this->respond(['status' => 'success', 'tipo' => 'salida']);
        } else {
            // ABRIR
            $builder->insert([
                'usuario_id' => $usuarioId, 
                'empresa_id' => $data['empresa_id'], 
                'entrada' => date('Y-m-d H:i:s')
            ]);
            return $this->respond(['status' => 'success', 'tipo' => 'entrada']);
        }
    }

    // -------------------------------------------------------------------------
    // 3. SOLICITAR VACACIONES
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // 4. GET SOLICITUDES (Legacy / Opcional)
    // -------------------------------------------------------------------------
    public function getSolicitudes($userId = null) {
        $db = \Config\Database::connect();
        $data = $db->table('solicitudes_ausencia')
                   ->where('usuario_id', $userId)
                   ->orderBy('created_at', 'DESC')
                   ->get()
                   ->getResultArray();
        return $this->respond($data);
    }
}