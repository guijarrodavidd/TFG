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
}