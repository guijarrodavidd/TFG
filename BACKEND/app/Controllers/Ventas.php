<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Ventas extends ResourceController
{
    protected $format = 'json';

    public function create()
    {
        $db = \Config\Database::connect();
        $json = $this->request->getJSON();

        if (!$json || empty($json->detalles)) {
            return $this->fail('No hay productos en la venta', 400);
        }

        if (empty($json->cliente_id)) {
            return $this->fail('Error: El cliente es obligatorio.', 400);
        }

        $db->transStart();

        try {
            // CODIGO TICKET
            $codigoTransaccion = 'TRX-' . date('YmdHis') . '-' . rand(100, 999);


            $dataVenta = [
                'codigo_transaccion' => $codigoTransaccion,
                'empresa_id'         => $json->empresa_id,
                'cliente_id'         => $json->cliente_id,
                'usuario_id'         => $json->usuario_id,
                'total'              => $json->total,
                'estado'             => 'Cerrada',
                'tienda_id'          => 'WEB',
                'fecha_venta'        => date('Y-m-d H:i:s')
            ];

            $db->table('ventas')->insert($dataVenta);
            $ventaId = $db->insertID(); 

            foreach ($json->detalles as $detalle) {
                
                $dataDetalle = [
                    'venta_id'        => $ventaId,
                    'producto_id'     => $detalle->producto_id,
                    'cantidad'        => $detalle->cantidad,
                    'precio_unitario' => $detalle->precio_unitario,
                    'subtotal'        => $detalle->subtotal
                ];

                $db->table('ventas_detalles')->insert($dataDetalle);

                // RESTAR STOCK
                $db->table('productos')
                   ->where('id', $detalle->producto_id)
                   ->decrement('stock_actual', $detalle->cantidad);
            }

            $db->transComplete();

            if ($db->transStatus() === false) {
                return $this->failServerError('Error al procesar la transacción en base de datos.');
            }

            return $this->respondCreated([
                'message' => 'Venta registrada con éxito', 
                'codigo' => $codigoTransaccion
            ]);

        } catch (\Exception $e) {
            return $this->failServerError($e->getMessage());
        }
    }
}