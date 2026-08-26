<?php
require_once "../src/models/Usuarios.php";
class UsuarioController {
    public function getAll() {
        try{
        
        $usuario=Usuarios::all();
        echo json_encode($usuario);
        }catch(Exception $e){
            http_response_code(500);
            echo json_encode(["error" => 'Error al obtener los usuarios']);
        }
    }
}