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
        // die($jsonData);
        $data = json_decode($jsonData, true);

        if (json_last_error() != JSON_ERROR_NONE) {
            echo json_encode([

                "status" => "error conversion",
                "message" => json_last_error_msg(),
            ]);
            return;
        }

        // Validar que el campo codBarras no esté vacío
        if (!isset($data['codbarras']) || trim($data['codbarras']) == "") {
            echo json_encode([
                "status" => "error",
                "message" => "El campo codbarras es obligatorio"
            ]);
            return;
        }
        $producto = productos::update($id, $data);
        if ($producto) {
            echo json_encode([
                "estado" => "true",
                "message" => "Producto actualizado correctamente"
            ]);
            return;
        }
        echo json_encode($producto);
    }


    // "nombre":"computadora ",

    //"descripcion":"computadora de escritorio",



    //"stock_Actual":150,

    //"stock_Minimo":10,

    //"precio_Costo":20.00

    
    // Adicionar producto
    public function add()
    {
        $jsonData = file_get_contents('php://input');
        $data = json_decode($jsonData, true);

        

        //VALIDACION DE CAMPOS OBLIGATORIOS
        $producto = productos::add($data);
        if ($producto) {
            echo json_encode([
                "estado" => "true",
                "message" => "Producto agregado correctamente",
                "id" => $producto
            ]);
            return;
        }
    }
      
}