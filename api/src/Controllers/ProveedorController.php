<?php
require_once "../src/models/Proveedores.php";
class ProveedorController {
    public function getAll() {
        try{
        
        $proveedor=Proveedores::all();
        echo json_encode($proveedor);
        }catch(Exception $e){
            http_response_code(500);
            echo json_encode(["error" => 'Error al obtener los proveedores']);
        }
    }
}