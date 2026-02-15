<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Admin extends ResourceController {
    
    protected $format = 'json';

    // --- SEGURIDAD: SOLO ROL 1 ---
    private function verificarAdmin($usuarioId) {
        $db = \Config\Database::connect();
        $user = $db->table('usuarios')->where('id', $usuarioId)->get()->getRowArray();
        return ($user && $user['rol_id'] == 1);
    }

    // 1. OBTENER TODAS LAS EMPRESAS Y SUS USUARIOS
    public function index($adminId = null) {
        if (!$this->verificarAdmin($adminId)) return $this->failForbidden('Acceso denegado');

        $db = \Config\Database::connect();
        
        // Obtener empresas
        $empresas = $db->table('empresas')->orderBy('id', 'DESC')->get()->getResultArray();

        // Obtener usuarios y pegarlos a cada empresa
        foreach ($empresas as &$emp) {
            $emp['usuarios'] = $db->table('usuarios')
                                  ->select('id, nombre, email, rol_id')
                                  ->where('empresa_id', $emp['id'])
                                  ->get()->getResultArray();
                                  
            // Mapear nombre de rol para el frontend
            foreach($emp['usuarios'] as &$u) {
                $u['rol_nombre'] = ($u['rol_id'] == 2) ? 'Encargado' : 'Empleado';
            }
        }

        return $this->respond($empresas);
    }

    // 2. CREAR O EDITAR EMPRESA
    public function guardarEmpresa() {
        $data = $this->request->getJSON(true);
        $adminId = $data['admin_id']; // ID del admin que hace la petición
        
        if (!$this->verificarAdmin($adminId)) return $this->failForbidden('Acceso denegado');

        $db = \Config\Database::connect();
        $datosEmpresa = [
            'nombre' => $data['nombre'],
            'cif' => $data['cif'],
            'direccion' => $data['direccion'],
            'telefono' => $data['telefono'],
            // Generamos token si es nueva
            'token_invitacion' => $data['id'] ? $data['token_invitacion'] : 'NEXUS-' . strtoupper(substr(md5(uniqid()), 0, 4))
        ];

        if (isset($data['id']) && $data['id']) {
            $db->table('empresas')->where('id', $data['id'])->update($datosEmpresa);
            return $this->respond(['msg' => 'Empresa actualizada']);
        } else {
            $db->table('empresas')->insert($datosEmpresa);
            return $this->respond(['msg' => 'Empresa creada']);
        }
    }

    // 3. ELIMINAR EMPRESA (Y SUS USUARIOS EN CASCADA)
    public function borrarEmpresa($id = null, $adminId = null) {
        if (!$this->verificarAdmin($adminId)) return $this->failForbidden('Acceso denegado');
        
        $db = \Config\Database::connect();
        $db->table('empresas')->where('id', $id)->delete();
        return $this->respondDeleted(['msg' => 'Empresa eliminada']);
    }

    // 4. CREAR USUARIO EN UNA EMPRESA
    public function crearUsuario() {
        $data = $this->request->getJSON(true);
        if (!$this->verificarAdmin($data['admin_id'])) return $this->failForbidden('Acceso denegado');

        $db = \Config\Database::connect();
        
        // Hashear password por defecto '123456'
        $passHash = password_hash('123456', PASSWORD_BCRYPT);

        $db->table('usuarios')->insert([
            'nombre' => $data['nombre'],
            'email'  => $data['email'],
            'password' => $passHash,
            'rol_id' => $data['rol_id'], // 2 Encargado, 3 Empleado
            'empresa_id' => $data['empresa_id']
        ]);

        return $this->respondCreated(['msg' => 'Usuario creado']);
    }

    // 5. BORRAR USUARIO
    public function borrarUsuario($id = null, $adminId = null) {
        if (!$this->verificarAdmin($adminId)) return $this->failForbidden('Acceso denegado');
        $db = \Config\Database::connect();
        $db->table('usuarios')->where('id', $id)->delete();
        return $this->respondDeleted(['msg' => 'Usuario eliminado']);
    }
}