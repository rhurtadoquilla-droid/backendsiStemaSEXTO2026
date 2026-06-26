<?php
require_once "../src/models/Categorias.php";
class CategoriaController {
    public function getAll() {
        try{
        
        $categoria=Categorias::all();
        echo json_encode($categoria);
        }catch(Exception $e){
            http_response_code(500);
            echo json_encode(["error" => 'Error al obtener las categorias']);
        }
    }
}