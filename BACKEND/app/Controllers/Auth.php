<?php namespace App\Controllers;

use App\Models\UsuarioModel;
use CodeIgniter\Controller;

class Auth extends Controller {

    public function login() {
        // Headers de seguridad para Angular
        header("Access-Control-Allow-Origin: http://localhost:4200");
        header("Access-Control-Allow-Headers: Content-Type");
        header("Access-Control-Allow-Methods: POST, OPTIONS");

        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

        $model = new UsuarioModel();
        
        $json = $this->request->getJSON();
        
        if (!$json || !isset($json->email) || !isset($json->password)) {
            return $this->response->setJSON([
                'status' => 'error', 
                'message' => 'Faltan datos (email o password)'
            ]);
        }

        $user = $model->where('email', $json->email)->first();

        if ($user && password_verify($json->password, $user['password'])) {
            unset($user['password']);
            return $this->response->setJSON(['status' => 'success', 'data' => $user]);
        }

        return $this->response->setStatusCode(401)->setJSON(['status' => 'error', 'message' => 'Login fallido']);
    }
}