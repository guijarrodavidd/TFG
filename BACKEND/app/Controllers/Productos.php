<?php namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class Productos extends ResourceController {
    
    protected $modelName = 'App\Models\ProductoModel';
    protected $format    = 'json';

    public function create() {
        $data = $this->request->getPost();
        
        // Validación básica (Opcional, pero recomendada)
        if (empty($data['nombre']) || empty($data['empresa_id'])) {
             return $this->fail('Faltan datos obligatorios', 400);
        }

        // Manejo de Imagen
        $file = $this->request->getFile('imagen');
        $imagenNombre = null;
        
        if ($file && $file->isValid() && !$file->hasMoved()) {
            $imagenNombre = $file->getRandomName();
            $file->move(ROOTPATH . 'public/uploads/productos', $imagenNombre);
        }

        $producto = [
            'empresa_id'   => $data['empresa_id'],
            'nombre'       => $data['nombre'],
            'sku'          => $data['sku'] ?? null,
            
            // --- CAMBIO IMPORTANTE AQUÍ 👇 ---
            'categoria_id' => !empty($data['categoria_id']) ? $data['categoria_id'] : null, 
            // ---------------------------------

            // Precio Coste (Base Imponible) que calculamos en Angular
            'precio_coste' => $data['precio_coste'] ?? 0, 
            
            'precio_venta' => $data['precio_venta'] ?? 0,
            'impuesto'     => 21.00, // Fijo por ahora
            'stock_actual' => $data['stock_actual'] ?? 0,
            'stock_minimo' => $data['stock_minimo'] ?? 5,
            'descripcion'  => $data['descripcion'] ?? '',
            'estado'       => $data['estado'] ?? 'activo',
            'imagen_url'   => $imagenNombre ? 'uploads/productos/' . $imagenNombre : null
        ];

        $db = \Config\Database::connect();
        
        try {
            $db->table('productos')->insert($producto);
            return $this->respondCreated(['message' => 'Producto creado con éxito']);
        } catch (\Exception $e) {
            // Esto nos dirá qué pasa si falla la base de datos
            return $this->failServerError('Error en BD: ' . $e->getMessage());
        }
    }
}