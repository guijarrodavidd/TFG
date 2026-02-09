<?php namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\ClienteModel;
use App\Models\VentaModel;

class Clientes extends ResourceController {
    protected $format = 'json';

    // Lista de clientes
    public function getByEmpresa($empresaId = null) {
        $model = new ClienteModel();
        return $this->respond($model->where('empresa_id', $empresaId)->findAll());
    }

    // Detalle de UN cliente + sus ventas
    public function getDetalle($id = null) {
        $clienteModel = new ClienteModel();
        $ventaModel = new VentaModel();

        $cliente = $clienteModel->find($id);
        if (!$cliente) return $this->failNotFound('Cliente no encontrado');

        // Buscamos sus compras
        $ventas = $ventaModel->where('cliente_id', $id)->orderBy('fecha_venta', 'DESC')->findAll();

        return $this->respond([
            'cliente' => $cliente,
            'compras' => $ventas
        ]);
    }
    // Crear nuevo cliente
    public function create() {
        $json = $this->request->getJSON();
        
        // Validación básica
        if (!$json || !isset($json->nombre) || !isset($json->empresa_id)) {
            return $this->fail('Datos incompletos', 400);
        }

        $clienteModel = new \App\Models\ClienteModel();
        
        // AQUÍ ES DONDE FALTABAN LOS CAMPOS NUEVOS 👇
        $nuevoCliente = [
            'empresa_id'       => $json->empresa_id,
            'nombre'           => $json->nombre,
            'nif'              => $json->nif ?? null,
            'email'            => $json->email ?? null,
            'telefono'         => $json->telefono ?? null,
            'direccion'        => $json->direccion ?? null,
            'tipo_cliente'     => $json->tipo_cliente ?? 'Residencial',
            // Añadimos estos dos:
            'fecha_nacimiento' => $json->fecha_nacimiento ?? null,
            'nacionalidad'     => $json->nacionalidad ?? 'España'
        ];

        try {
            $id = $clienteModel->insert($nuevoCliente);
            return $this->respondCreated(['id' => $id, 'message' => 'Cliente creado']);
        } catch (\Exception $e) {
            return $this->failServerError('Error al guardar: ' . $e->getMessage());
        }
    }
}