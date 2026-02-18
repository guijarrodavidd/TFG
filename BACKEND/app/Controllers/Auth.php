<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Auth extends ResourceController
{
    protected $modelName = 'App\Models\UsuarioModel';
    protected $format    = 'json';

    public function login()
    {
        try {
            $data = $this->request->getJSON(true);
            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;

            $usuario = $this->model->where('email', $email)->first();

            if (!$usuario || !password_verify($password, $usuario['password'])) {
                return $this->failUnauthorized('Credenciales incorrectas');
            }

            $token = bin2hex(random_bytes(16));
            
            try {
                $this->model->update($usuario['id'], ['token_sesion' => $token]);
            } catch (\Exception $e) {

            }

            return $this->respond([
                'status' => 'success',
                'data'   => $usuario, 
                'token'  => $token
            ]);

        } catch (\Exception $e) {
            return $this->failServerError($e->getMessage());
        }
    }

    public function registroEncargado()
    {
        $data = $this->request->getJSON(true);
        
        // MANEJO DE ERRORES
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