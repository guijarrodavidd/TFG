<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Dashboard extends ResourceController {
    
    protected $format = 'json';

    public function index($usuarioId = null) {
        try {
            $db = \Config\Database::connect();
            
            $usuario = $db->table('usuarios')->where('id', $usuarioId)->get()->getRowArray();
            
            if (!$usuario) {
                return $this->failNotFound('Usuario no encontrado');
            }
            
            $empresaId = $usuario['empresa_id'];

            $equipo = $db->table('usuarios')
                         ->select('id, nombre, email, rol_id')
                         ->where('empresa_id', $empresaId)
                         ->where('id !=', $usuarioId)
                         ->get()->getResultArray();

            foreach ($equipo as &$miembro) {
                if ($miembro['rol_id'] == 1) $miembro['rol'] = 'Administrador';
                elseif ($miembro['rol_id'] == 2) $miembro['rol'] = 'Encargado';
                else $miembro['rol'] = 'Empleado';

                $miembro['avatar'] = 'https://ui-avatars.com/api/?name=' . urlencode($miembro['nombre']) . '&background=random&color=fff&size=128';
            }

            $rendimiento = ['total' => 0, 'ventas' => 0];
            $ventasRecientes = [];

            if ($db->tableExists('ventas')) {
                $mesActual = date('Y-m');
                
                $resultadoMes = $db->table('ventas')
                                   ->selectSum('total')
                                   ->selectCount('id', 'cantidad_ventas')
                                   ->where('usuario_id', $usuarioId)
                                   ->like('fecha_venta', $mesActual, 'after')
                                   ->get()->getRowArray();
                
                $rendimiento['total'] = $resultadoMes['total'] ?? 0;
                $rendimiento['ventas'] = $resultadoMes['cantidad_ventas'] ?? 0;

                // ULTIMAS VENTAS
                if ($db->tableExists('clientes')) {
                    $ventasRecientes = $db->table('ventas')
                                          ->select('ventas.id, ventas.fecha_venta as created_at, ventas.total, clientes.nombre as cliente_nombre, ventas.estado')
                                          ->join('clientes', 'clientes.id = ventas.cliente_id', 'left')
                                          ->where('ventas.usuario_id', $usuarioId)
                                          ->orderBy('ventas.fecha_venta', 'DESC') // <--- CAMBIO AQUÍ
                                          ->limit(3)
                                          ->get()->getResultArray();
                                          

                    foreach($ventasRecientes as &$v) {
                        $estado = strtolower($v['estado'] ?? '');
                        if(strpos($estado, 'pagad') !== false) $v['color'] = 'success';
                        elseif(strpos($estado, 'pendient') !== false) $v['color'] = 'warning';
                        else $v['color'] = 'danger';
                    }
                }
            }

            return $this->respond([
                'rendimiento' => $rendimiento,
                'recientes' => $ventasRecientes,
                'equipo' => $equipo
            ]);

        } catch (\Throwable $e) {
            return $this->failServerError('Error cargando dashboard: ' . $e->getMessage());
        }
    }
}