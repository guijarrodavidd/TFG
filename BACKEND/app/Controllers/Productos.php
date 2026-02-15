<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class Productos extends ResourceController {
    
    protected $modelName = 'App\Models\ProductoModel';
    protected $format    = 'json';

    // 1. OBTENER PRODUCTOS DE UNA EMPRESA
    public function index($empresaId = null) {
        $db = \Config\Database::connect();
        
        $productos = $db->table('productos')
                        ->where('empresa_id', $empresaId)
                        ->orderBy('created_at', 'DESC')
                        ->get()->getResult();
        
        return $this->respond($productos);
    }

    // 2. OBTENER UN SOLO PRODUCTO
    public function getProductoById($id = null) {
        $db = \Config\Database::connect();
        $producto = $db->table('productos')->where('id', $id)->get()->getRowArray();
        
        if ($producto) {
            return $this->respond($producto);
        } else {
            return $this->failNotFound('Producto no encontrado');
        }
    }

    // 3. CREAR PRODUCTO
    public function create() {
        $data = $this->request->getPost();
        
        if (empty($data['nombre']) || empty($data['empresa_id'])) {
             return $this->fail('Faltan datos obligatorios', 400);
        }

        $file = $this->request->getFile('imagen');
        $imagenNombre = null;
        
        if ($file && $file->isValid() && !$file->hasMoved()) {
            $imagenNombre = $file->getRandomName();
            $file->move(FCPATH . 'uploads/productos', $imagenNombre);
        }

        $producto = [
            'empresa_id'   => $data['empresa_id'],
            'nombre'       => $data['nombre'],
            'sku'          => $data['sku'] ?? null,
            'categoria_id' => (!empty($data['categoria_id']) && $data['categoria_id'] !== 'null') ? $data['categoria_id'] : null, 
            'precio_coste' => $data['precio_coste'] ?? 0, 
            'precio_venta' => $data['precio_venta'] ?? 0,
            'impuesto'     => 21.00,
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
            return $this->failServerError('Error en BD: ' . $e->getMessage());
        }
    }

    // 4. ACTUALIZAR PRODUCTO (Arregla el error 501 redireccionando el método automático)
    public function update($id = null) {
        return $this->updateProducto($id);
    }

    public function updateProducto($id = null) {
        $data = $this->request->getPost();
        
        if (!$id) return $this->fail('ID de producto no válido');

        $updateData = [
            'nombre'       => $data['nombre'] ?? '',
            'sku'          => $data['sku'] ?? null,
            'categoria_id' => (!empty($data['categoria_id']) && $data['categoria_id'] !== 'null') ? $data['categoria_id'] : null,
            'precio_coste' => $data['precio_coste'] ?? 0,
            'precio_venta' => $data['precio_venta'] ?? 0,
            'stock_actual' => $data['stock_actual'] ?? 0,
            'stock_minimo' => $data['stock_minimo'] ?? 5,
            'descripcion'  => $data['descripcion'] ?? '',
            'estado'       => $data['estado'] ?? 'activo'
        ];

        $file = $this->request->getFile('imagen');
        if ($file && $file->isValid() && !$file->hasMoved()) {
            $imagenNombre = $file->getRandomName();
            $file->move(FCPATH . 'uploads/productos', $imagenNombre);
            $updateData['imagen_url'] = 'uploads/productos/' . $imagenNombre;
        }

        $db = \Config\Database::connect();
        
        try {
            $db->table('productos')->where('id', $id)->update($updateData);
            return $this->respond(['message' => 'Producto actualizado correctamente']);
        } catch (\Exception $e) {
            return $this->failServerError('Error al actualizar: ' . $e->getMessage());
        }
    }

    // 5. ELIMINAR PRODUCTO (Nueva función solicitada)
    public function borrarProducto($id = null) {
        if (!$id) return $this->fail('ID no válido');

        $db = \Config\Database::connect();
        
        // Opcional: Podrías buscar el registro primero para borrar el archivo físico de la carpeta uploads
        
        if ($db->table('productos')->where('id', $id)->delete()) {
            return $this->respondDeleted(['message' => 'Producto eliminado del almacén']);
        }
        
        return $this->failServerError('No se pudo eliminar el producto');
    }
}