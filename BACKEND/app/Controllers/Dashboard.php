<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Dashboard extends ResourceController {
    
    protected $format = 'json';

    public function index($usuarioId = null) {
        try {
            $db = \Config\Database::connect();
            
            // 1. OBTENER USUARIO Y SU EMPRESA
            $usuario = $db->table('usuarios')->where('id', $usuarioId)->get()->getRowArray();
            
            if (!$usuario) {
                return $this->failNotFound('Usuario no encontrado');
            }
            
            $empresaId = $usuario['empresa_id'];

            // 2. OBTENER EQUIPO
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

            // 3. RENDIMIENTO Y VENTAS
            $rendimiento = ['total' => 0, 'ventas' => 0];
            $ventasRecientes = [];

            if ($db->tableExists('ventas')) {
                $mesActual = date('Y-m');
                
                // --- CORRECCIÓN 1: Usamos 'fecha_venta' en lugar de 'created_at' ---
                $resultadoMes = $db->table('ventas')
                                   ->selectSum('total')
                                   ->selectCount('id', 'cantidad_ventas')
                                   ->where('usuario_id', $usuarioId)
                                   ->like('fecha_venta', $mesActual, 'after') // <--- CAMBIO AQUÍ
                                   ->get()->getRowArray();
                
                $rendimiento['total'] = $resultadoMes['total'] ?? 0;
                $rendimiento['ventas'] = $resultadoMes['cantidad_ventas'] ?? 0;

                // Ventas recientes
                if ($db->tableExists('clientes')) {
                    // --- CORRECCIÓN 2 y 3: Aliamos fecha_venta como created_at para el frontend ---
                    $ventasRecientes = $db->table('ventas')
                                          ->select('ventas.id, ventas.fecha_venta as created_at, ventas.total, clientes.nombre as cliente_nombre, ventas.estado')
                                          ->join('clientes', 'clientes.id = ventas.cliente_id', 'left')
                                          ->where('ventas.usuario_id', $usuarioId)
                                          ->orderBy('ventas.fecha_venta', 'DESC') // <--- CAMBIO AQUÍ
                                          ->limit(3)
                                          ->get()->getResultArray();
                                          
                    // Asignar color según estado para que el HTML se vea bonito
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