<?php
include_once __DIR__ . "/../Config/conexionDB.php";

class Productos
{
    // Mostrar Producto
    public static function all()
    {
        $sql = "SELECT * FROM productos";
        return ConexionPDO::query($sql);
    }

    // Actualizar Producto
    public static function update($id, $data)
    {
        if (!isset($data['id'])) {
            unset($data['id']);
        }
        $campos = [];
        $valores = [];
        // construir datos
        foreach ($data as $columna => $valor) {
            $campos[] = "$columna=:$columna";
            $valores[":$columna"] = $valor;
        }
        $stringCampos = implode(',', $campos);

//preparamos la consulta
$sql = "UPDATE productos SET $stringCampos WHERE id=:id";
$valores[':id'] = $id;

$result = ConexionPDO::execute($sql, $valores,false);

//$sql = "SELECT * FROM productos";

return $result; //ConexionPDO::query($sql);
    }
    // Adicionar producto
    public static function add($data)
    {
        if (!is_array($data) || empty($data)) {
            return ["ERROR" => "No se recibieron datos para registrar el producto"];
        }

        unset($data['id']);

        $campos = [];
        $valores = [];

        // construir datos
        foreach ($data as $columna => $valor) {
            $campos[] = $columna;
            $valores[":$columna"] = $valor;
        }

        $stringCampos = implode(',', $campos);
        $stringValores = implode(',', array_keys($valores));

        //preparamos la consulta
        $sql = "INSERT INTO productos ($stringCampos) VALUES ($stringValores)";
        $RESULT = ConexionPDO::execute($sql, $valores);

        return $RESULT; //ConexionPDO::query($sql);
    }
}
