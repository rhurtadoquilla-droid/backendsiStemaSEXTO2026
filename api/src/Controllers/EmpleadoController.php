<?php
require_once "../src/models/Empleados.php";
class EmpleadoController {
    public function getAll() {
        try{
        
        $empleado=Empleados::all();
        echo json_encode($empleado);
        }catch(Exception $e){
            http_response_code(500);
            echo json_encode(["error" => 'Error al obtener los empleados']);
        }
    }
}
