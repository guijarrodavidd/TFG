<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Auth extends ResourceController
{
    protected $modelName = 'App\Models\UsuarioModel';
    protected $format    = 'json';

    // 1. INICIAR SESIÓN
    public function login()
    {
        try {
            $data = $this->request->getJSON(true);
            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;

            // Buscamos usuario
            $usuario = $this->model->where('email', $email)->first();

            if (!$usuario || !password_verify($password, $usuario['password'])) {
                return $this->failUnauthorized('Credenciales incorrectas');
            }

            // Generar token simple
            $token = bin2hex(random_bytes(16));
            
            // Intentamos guardar el token. 
            // Si la columna 'token_sesion' no existe en la BD, esto podría fallar.
            // Lo capturamos para que no rompa el login.
            try {
                $this->model->update($usuario['id'], ['token_sesion' => $token]);
            } catch (\Exception $e) {
                // Si falla la actualización del token, seguimos permitiendo el login
                // pero logueamos el error internamente (opcional)
                // log_message('error', 'Error guardando token: ' . $e->getMessage());
            }

            return $this->respond([
                'status' => 'success',
                'data'   => $usuario, // Enviamos datos usuario
                'token'  => $token
            ]);

        } catch (\Exception $e) {
            // Captura cualquier otro error fatal y lo muestra legible
            return $this->failServerError($e->getMessage());
        }
    }

    // 2. REGISTRO JEFE / ENCARGADO
    public function registroEncargado()
    {
        $data = $this->request->getJSON(true);
        
        // Validación mínima
        if (empty($data['email']) || empty($data['password'])) {
             return $this->fail('Faltan datos');
        }

        $nuevoUsuario = [
            'nombre'     => $data['nombre'],
            'email'      => $data['email'],
            'password'   => password_hash($data['password'], PASSWORD_DEFAULT),
            'rol_id'     => 2, 
            'empresa_id' => null 
        ];

        if ($this->model->insert($nuevoUsuario)) {
            return $this->respondCreated(['status' => 'success', 'id' => $this->model->getInsertID()]);
        } else {
            return $this->failServerError('Error al crear usuario');
        }
    }

    public function registroEmpleado()
    {
        $rules = [
            'nombre'   => 'required|min_length[3]',
            'email'    => 'required|valid_email|is_unique[usuarios.email]',
            'password' => 'required|min_length[6]',
            'token'    => 'required|integer'
        ];

        if (!$this->validate($rules)) {
            return $this->fail($this->validator->getErrors());
        }

        $data = $this->request->getJSON(true);

        $nuevoUsuario = [
            'nombre'     => $data['nombre'],
            'email'      => $data['email'],
            'password'   => password_hash($data['password'], PASSWORD_DEFAULT),
            'rol_id'     => 3,
            'empresa_id' => $data['token']
        ];

        if ($this->model->insert($nuevoUsuario)) {
            return $this->respondCreated(['status' => 'success', 'message' => '¡Bienvenido al equipo!']);
        } else {
            return $this->failServerError('Error al guardar el usuario.');
        }
    }
}