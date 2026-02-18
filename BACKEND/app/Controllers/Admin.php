<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Admin extends ResourceController {
    
    protected $format = 'json';

    // SOLO PARA SUPERADMIN
    private function verificarAdmin($usuarioId) {
        if (!$usuarioId) return false;
        $db = \Config\Database::connect();
        $user = $db->table('usuarios')->where('id', $usuarioId)->get()->getRowArray();
        return ($user && (int)$user['rol_id'] === 1);
    }

    public function index($adminId = null) {
        if (!$this->verificarAdmin($adminId)) {
            return $this->failForbidden('Acceso denegado: Se requiere rol de Superadministrador.');
        }

        $db = \Config\Database::connect();
        $empresas = $db->table('empresas')->orderBy('id', 'DESC')->get()->getResultArray();

        foreach ($empresas as &$emp) {
            $emp['usuarios'] = $db->table('usuarios')
                                  ->select('id, nombre, email, rol_id')
                                  ->where('empresa_id', $emp['id'])
                                  ->get()->getResultArray();
                                  
            foreach($emp['usuarios'] as &$u) {
                $u['rol_nombre'] = ($u['rol_id'] == 2) ? 'Encargado' : 'Empleado';
            }
        }
        return $this->respond($empresas);
    }

    public function guardarEmpresa() {
        $data = $this->request->getJSON(true);
        if (!$this->verificarAdmin($data['admin_id'] ?? null)) {
            return $this->failForbidden('Acceso denegado.');
        }

        $db = \Config\Database::connect();
        $datosEmpresa = [
            'nombre'    => $data['nombre'],
            'cif'       => $data['cif'],
            'direccion' => $data['direccion'],
            'telefono'  => $data['telefono'],
            'token_invitacion' => $data['id'] ? $data['token_invitacion'] : 'NEXUS-' . strtoupper(substr(md5(uniqid()), 0, 4))
        ];

        if (isset($data['id']) && $data['id']) {
            $db->table('empresas')->where('id', $data['id'])->update($datosEmpresa);
            return $this->respond(['msg' => 'Empresa actualizada correctamente']);
        } else {
            $db->table('empresas')->insert($datosEmpresa);
            return $this->respond(['msg' => 'Empresa creada correctamente']);
        }
    }

    public function borrarEmpresa($id = null, $adminId = null) {
        if (!$this->verificarAdmin($adminId)) return $this->failForbidden('Acceso denegado');
        
        $db = \Config\Database::connect();
        $db->table('empresas')->where('id', $id)->delete();
        return $this->respondDeleted(['msg' => 'Empresa eliminada correctamente']);
    }

    public function crearUsuario() {
        $data = $this->request->getJSON(true);
        if (!$this->verificarAdmin($data['admin_id'] ?? null)) return $this->failForbidden('Acceso denegado');

        $db = \Config\Database::connect();
        $passHash = password_hash('123456', PASSWORD_BCRYPT);

        $db->table('usuarios')->insert([
            'nombre'     => $data['nombre'],
            'email'      => $data['email'],
            'password'   => $passHash,
            'rol_id'     => $data['rol_id'],
            'empresa_id' => $data['empresa_id']
        ]);

        return $this->respondCreated(['msg' => 'Usuario creado correctamente']);
    }

    public function borrarUsuario($id = null, $adminId = null) {
        if (!$this->verificarAdmin($adminId)) return $this->failForbidden('Acceso denegado');
        $db = \Config\Database::connect();
        $db->table('usuarios')->where('id', $id)->delete();
        return $this->respondDeleted(['msg' => 'Usuario eliminado correctamente']);
    }
}