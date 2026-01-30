<?php namespace App\Controllers;

use App\Models\UsuarioModel;
use CodeIgniter\Controller;

class Auth extends Controller {

    public function login() {
        // Para que Angular pueda consultar desde otro puerto/dominio (CORS)
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
        header("Access-Control-Allow-Methods: POST, OPTIONS");

        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

        $model = new UsuarioModel();
        
        // Recogemos los datos (vengan de formulario o de un JSON de Angular)
        $json = $this->request->getJSON();
        $email = $json->email ?? $this->request->getPost('email');
        $password = $json->password ?? $this->request->getPost('password');

        $user = $model->where('email', $email)->first();

        if ($user && password_verify($password, $user['password'])) {
            // Aquí quitamos la password antes de enviar los datos
            unset($user['password']);
            
            return $this->response->setJSON([
                "status" => "success",
                "message" => "Bienvenido a NEXUS",
                "data" => $user
            ]);
        }

        return $this->response->setStatusCode(401)->setJSON([
            "status" => "error",
            "message" => "Credenciales inválidas"
        ]);
    }
}