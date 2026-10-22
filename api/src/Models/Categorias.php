<?php
include_once __DIR__."/../config/conexionDB.php";
class Categorias
{
    private static function validar($data)
    {
        if (!is_array($data) || empty(trim((string)($data['nombre'] ?? '')))) {
            return ['ERROR' => 'El nombre de la categoría es obligatorio'];
        }

        if (!preg_match('/^.{1,50}$/us', trim((string)$data['nombre']))) {
            return ['ERROR' => 'El nombre no puede superar 50 caracteres'];
        }

        if (!preg_match('/^.{0,250}$/us', (string)($data['descripcion'] ?? ''))) {
            return ['ERROR' => 'La descripción no puede superar 250 caracteres'];
        }

        return [];
    }

    public static function all()
    {
        $sql="SELECT * FROM categorias";
        return ConexionPDO::query($sql);
    }

    public static function add($data)
    {
        $validacion = self::validar($data);
        if ($validacion) return $validacion;

        return ConexionPDO::execute(
            'INSERT INTO categorias (nombre, descripcion) VALUES (:nombre, :descripcion)',
            [':nombre' => trim($data['nombre']), ':descripcion' => trim((string)($data['descripcion'] ?? ''))]
        );
    }

    public static function update($id, $data)
    {
        $validacion = self::validar($data);
        if ($validacion) return $validacion;

        return ConexionPDO::execute(
            'UPDATE categorias SET nombre = :nombre, descripcion = :descripcion WHERE id = :id',
            [':nombre' => trim($data['nombre']), ':descripcion' => trim((string)($data['descripcion'] ?? '')), ':id' => $id]
        );
    }

    public static function delete($id)
    {
        $products = ConexionPDO::query(
            'SELECT COUNT(*) AS total FROM productos WHERE cod_categoria = :id',
            [':id' => $id]
        );
        if (isset($products['ERROR'])) {
            return ['ERROR' => 'No se pudo comprobar si la categoría tiene productos relacionados'];
        }
        if ((int)($products[0]['total'] ?? 0) > 0) {
            return ['ERROR' => 'No se puede eliminar la categoría porque tiene productos relacionados'];
        }

        return ConexionPDO::execute('DELETE FROM categorias WHERE id = :id', [':id' => $id]);
    }
}