<?php namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Personal extends ResourceController {
    
    protected $format = 'json';
    protected $db;

    public function __construct() {
        $this->db = \Config\Database::connect();
    }

    // OBTIENE EL ESTADO ACTUAL (¿Está trabajando? ¿Historial?)
    public function getDashboard($usuarioId = null) {
        $db = \Config\Database::connect();
        
        // 1. Obtener Usuario + Nombre Empresa
        $usuario = $db->table('usuarios')
                      ->select('usuarios.*, empresas.nombre as nombre_empresa')
                      ->join('empresas', 'empresas.id = usuarios.empresa_id', 'left')
                      ->where('usuarios.id', $usuarioId)
                      ->get()->getRow();

        // 2. Turno Activo
        $fichajeModel = $db->table('fichajes');
        $turnoActual = $fichajeModel->where('usuario_id', $usuarioId)
                                    ->where('salida', NULL)
                                    ->get()->getRow();

        // 3. Historial (AMPLIADO a 100 para permitir navegación entre semanas)
        $historial = $fichajeModel->where('usuario_id', $usuarioId)
                                  ->orderBy('entrada', 'DESC')
                                  ->limit(100) // Traemos suficientes para navegar
                                  ->get()->getResult();

        // 4. Ausencias y Nómina
        $ausencias = $db->table('ausencias')->where('usuario_id', $usuarioId)->get()->getRow();
        $nomina = $db->table('nominas')->where('usuario_id', $usuarioId)->orderBy('id', 'DESC')->get()->getRow();

        return $this->respond([
            'nombre_empresa' => $usuario->nombre_empresa, // <--- NUEVO
            'turno_activo' => $turnoActual,
            'historial' => $historial,
            'ausencias' => $ausencias,
            'nomina' => $nomina
        ]);
    }

    // ACCIÓN DE FICHAR (PLAY / STOP)
    public function fichar() {
        $json = $this->request->getJSON();
        $usuarioId = $json->usuario_id;
        $empresaId = $json->empresa_id;

        $fichajeModel = $this->db->table('fichajes');

        // Buscamos si ya tiene uno abierto
        $abierto = $fichajeModel->where('usuario_id', $usuarioId)->where('salida', NULL)->get()->getRow();

        if ($abierto) {
            // == STOP: CERRAR TURNO ==
            $salida = date('Y-m-d H:i:s');
            
            // Calculamos horas trabajadas
            $entrada = strtotime($abierto->entrada);
            $fin = strtotime($salida);
            $horas = round(abs($fin - $entrada) / 3600, 2);

            $fichajeModel->where('id', $abierto->id)->update([
                'salida' => $salida,
                'total_horas' => $horas
            ]);
            
            return $this->respond(['status' => 'stopped', 'message' => 'Turno cerrado']);
        } else {
            // == PLAY: ABRIR TURNO ==
            $fichajeModel->insert([
                'usuario_id' => $usuarioId,
                'empresa_id' => $empresaId,
                'entrada' => date('Y-m-d H:i:s')
            ]);
            
            return $this->respond(['status' => 'started', 'entrada' => date('Y-m-d H:i:s')]);
        }
    }
    // Obtener solicitudes del usuario
    public function getSolicitudes($usuarioId) {
        $db = \Config\Database::connect();
        $builder = $db->table('vacaciones');
        $solicitudes = $builder->where('usuario_id', $usuarioId)
                               ->orderBy('fecha_inicio', 'DESC')
                               ->get()->getResult();
        return $this->respond($solicitudes);
    }

    // Guardar nueva solicitud
    public function solicitarVacaciones() {
        $json = $this->request->getJSON();
        
        if (!isset($json->usuario_id) || !isset($json->fecha_inicio) || !isset($json->fecha_fin)) {
            return $this->fail('Datos incompletos', 400);
        }

        $db = \Config\Database::connect();
        
        $data = [
            'usuario_id'   => $json->usuario_id,
            'fecha_inicio' => $json->fecha_inicio,
            'fecha_fin'    => $json->fecha_fin,
            'estado'       => 'solicitado', // Estado inicial (PENDIENTE)
            'comentarios'  => $json->comentarios ?? ''
        ];

        $db->table('vacaciones')->insert($data);
        
        return $this->respondCreated(['message' => 'Solicitud enviada']);
    }
}