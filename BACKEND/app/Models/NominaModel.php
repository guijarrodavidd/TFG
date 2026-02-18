<?php

namespace App\Models;

use CodeIgniter\Model;

class NominaModel extends Model
{
    protected $table            = 'nominas';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $allowedFields    = ['usuario_id', 'mes', 'archivo'];
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = '';
}