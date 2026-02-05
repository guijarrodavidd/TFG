<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use App\Models\UsuarioModel;
use App\Models\EmpresaModel;

class Auth extends ResourceController 
{
    protected $format = 'json';

    public function login()
    {
        $json = $this->request->getJSON();

        // 1. Validar que llegan los datos
        if (!$json || !isset($json->email) || !isset($json->password)) {
            return $this->respond(['status' => 'error', 'message' => 'Faltan datos'], 400);
        }

        // 2. Buscar al usuario por Email
        $usuarioModel = new UsuarioModel();
        $user = $usuarioModel->where('email', $json->email)->first();

        // 3. Si no existe el usuario
        if (!$user) {
            return $this->respond(['status' => 'error', 'message' => 'Usuario no encontrado'], 401);
        }

        // 4. Verificar la contraseña
        if (!password_verify($json->password, $user['password'])) {
            return $this->respond(['status' => 'error', 'message' => 'Contraseña incorrecta'], 401);
        }

        // 5. ¡ÉXITO! Devolvemos los datos para que Angular los guarde
        return $this->respond([
            'status' => 'success',
            'data' => [
                'id'           => $user['id'],
                'nombre'       => $user['nombre'],
                'email'        => $user['email'],
                'rol_id'       => $user['rol_id'],
                'empresa_id'   => $user['empresa_id'],
                'token_sesion' => bin2hex(random_bytes(16)) // Token simulado
            ]
        ]);
    }
    // REGISTRO DE NUEVOS ENCARGADOS (JEFE DE EMPRESA)
    public function registroEncargado() {
        $json = $this->request->getJSON();
        
        if (!$json || !isset($json->email) || !isset($json->password) || !isset($json->nombre)) {
            return $this->respond(['status' => 'error', 'message' => 'Faltan datos'], 400);
        }

        // VALIDACIÓN DE CONTRASEÑA ROBUSTA (BACKEND)
        $password = $json->password;
        $nombre = strtolower($json->nombre);

        if (strlen($password) < 8) {
            return $this->respond(['status' => 'error', 'message' => 'La contraseña debe tener al menos 8 caracteres'], 400);
        }
        if (!preg_match('/[A-Z]/', $password)) {
            return $this->respond(['status' => 'error', 'message' => 'Falta una mayúscula'], 400);
        }
        if (!preg_match('/[a-z]/', $password)) {
            return $this->respond(['status' => 'error', 'message' => 'Falta una minúscula'], 400);
        }
        if (!preg_match('/[0-9]/', $password)) {
            return $this->respond(['status' => 'error', 'message' => 'Falta un número'], 400);
        }
        if (!preg_match('/[\W]/', $password)) { // \W busca cualquier cosa que no sea letra ni número
            return $this->respond(['status' => 'error', 'message' => 'Falta un caracter especial'], 400);
        }
        if (strpos(strtolower($password), $nombre) !== false && strlen($nombre) > 3) {
            return $this->respond(['status' => 'error', 'message' => 'La contraseña no puede contener tu nombre'], 400);
        }

        $usuarioModel = new UsuarioModel();

        // Comprobar email
        if ($usuarioModel->where('email', $json->email)->first()) {
            return $this->respond(['status' => 'error', 'message' => 'Este email ya está registrado'], 400);
        }

        // Crear usuario
        $nuevoUsuario = [
            'nombre'     => $json->nombre,
            'email'      => $json->email,
            'password'   => password_hash($json->password, PASSWORD_DEFAULT),
            'rol_id'     => 2,
            'empresa_id' => null 
        ];

        $usuarioModel->insert($nuevoUsuario);

        return $this->respond(['status' => 'success', 'message' => 'Cuenta creada correctamente']);
    }
    public function registroEmpleado() {
        $json = $this->request->getJSON();
        
        if (!$json || !isset($json->token) || !isset($json->email)) {
            return $this->respond(['status' => 'error', 'message' => 'Datos incompletos'], 400);
        }

        $empresaModel = new \App\Models\EmpresaModel();
        $empresa = $empresaModel->where('token_invitacion', $json->token)->first();

        if (!$empresa) {
            return $this->respond(['status' => 'error', 'message' => 'Token de invitación inválido'], 404);
        }

        $usuarioModel = new \App\Models\UsuarioModel();
        
        $nuevoUsuario = [
            'nombre'     => $json->nombre,
            'email'      => $json->email,
            'password'   => password_hash($json->password, PASSWORD_DEFAULT),
            'rol_id'     => 3,        
            'empresa_id' => $empresa['id']
        ];

        try {
            $usuarioModel->insert($nuevoUsuario);
            return $this->respond(['status' => 'success', 'message' => 'Empleado registrado']);
        } catch (\Exception $e) {
            return $this->respond(['status' => 'error', 'message' => 'El email ya existe'], 400);
        }
    }
}