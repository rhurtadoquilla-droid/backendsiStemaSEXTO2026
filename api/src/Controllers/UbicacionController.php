<?php
require_once "../src/models/Ubicaciones.php";
class UbicacionController   {
    public function getAll() {
        try{
        
        $ubicacion=Ubicaciones::all();
        echo json_encode($ubicacion );
        }catch(Exception $e){
            http_response_code(500);
            echo json_encode(["error" => 'Error al obtener las ubicaciones']);
        }
    }
}