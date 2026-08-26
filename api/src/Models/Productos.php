<?php
include_once __DIR__ . "/../Config/conexionDB.php";

class Productos
{
    private static function validarDatosObligatorios($data, $accion)
    {
        if (!is_array($data) || empty($data)) {
            return ["ERROR" => "No se recibieron datos para $accion el producto"];
        }

        $camposObligatorios = [
            "codbarras" => "El campo codbarras es obligatorio",
            "nombre" => "El campo nombre es obligatorio",
            "descripcion" => "El campo descripcion es obligatorio",
            "stock_actual" => "El campo stock_actual es obligatorio",
            "stock_minimo" => "El campo stock_minimo es obligatorio",
            "precio_costo" => "El campo precio_costo es obligatorio",
            "cod_categoria" => "El campo cod_categoria es obligatorio"
        ];

        $errores = [];

        foreach ($camposObligatorios as $campo => $mensaje) {
            if (!isset($data[$campo]) || trim((string)$data[$campo]) === "") {
                $errores[$campo] = $mensaje;
            }
        }

        if (!empty($errores)) {
            return [
                "ERROR" => "Faltan datos obligatorios",
                "campos" => $errores
            ];
        }

        return [];
    }

    // Mostrar Producto
    public static function all()
    {
        $sql = "SELECT * FROM productos";
        return ConexionPDO::query($sql);
    }

    // Actualizar Producto
    public static function update($id, $data)
    {
        $validacion = self::validarDatosObligatorios($data, "actualizar");
        if (!empty($validacion)) {
            return $validacion;
        }

        unset($data['id']);

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

$result = ConexionPDO::execute($sql, $valores);

//$sql = "SELECT * FROM productos";

return $result; //ConexionPDO::query($sql);
    }
    // Adicionar producto
    public static function add($data)
    {
        $validacion = self::validarDatosObligatorios($data, "registrar");
        if (!empty($validacion)) {
            return $validacion;
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

    // Eliminar producto
    public static function delete($id)
    {
        $sql = "DELETE FROM productos WHERE id=:id";
        $valores = [":id" => $id];

        return ConexionPDO::execute($sql, $valores);
    }
}
