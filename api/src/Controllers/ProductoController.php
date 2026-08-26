<?php

require_once "../src/models/productos.php";

class ProductoController
{
    public function getAll()
    {
        $producto = productos::all();
        echo json_encode($producto);
    }

    // Actualizar producto
    public function update($id)
    {
        $jsonData = file_get_contents('php://input');
        $data = json_decode($jsonData, true);

        if (json_last_error() != JSON_ERROR_NONE) {
            echo json_encode([
                "status" => "error conversion",
                "message" => json_last_error_msg(),
            ]);
            return;
        }

        $producto = productos::update($id, $data);

        if (isset($producto["ERROR"])) {
            echo json_encode([
                "estado" => "false",
                "message" => $producto["ERROR"],
                "campos" => $producto["campos"] ?? []
            ]);
            return;
        }

        if ($producto) {
            echo json_encode([
                "estado" => "true",
                "message" => "Producto actualizado correctamente"
            ]);
            return;
        }

        echo json_encode($producto);
    }

    // Adicionar producto
    public function add()
    {
        $jsonData = file_get_contents('php://input');
        $data = json_decode($jsonData, true);

        if (json_last_error() != JSON_ERROR_NONE) {
            echo json_encode([
                "status" => "error conversion",
                "message" => json_last_error_msg(),
            ]);
            return;
        }

        $producto = productos::add($data);

        if (isset($producto["ERROR"])) {
            echo json_encode([
                "estado" => "false",
                "message" => $producto["ERROR"],
                "campos" => $producto["campos"] ?? []
            ]);
            return;
        }

        if ($producto) {
            echo json_encode([
                "estado" => "true",
                "message" => "Producto agregado correctamente",
                "id" => $producto
            ]);
            return;
        }
    }

    // Eliminar producto
    public function delete($id)
    {
        $producto = productos::delete($id);

        if (isset($producto["ERROR"])) {
            echo json_encode([
                "estado" => "false",
                "message" => "No se pudo eliminar el producto",
                "error" => $producto["ERROR"]
            ]);
            return;
        }

        echo json_encode([
            "estado" => "true",
            "message" => "Producto eliminado correctamente"
        ]);
    }
}
