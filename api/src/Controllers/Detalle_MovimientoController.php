<?php
require_once "../src/models/Detalle_Movimientos.php";
class Detalle_MovimientoController {
    public function getAll() {
        try{
        
        $detalle_movimiento=Detalle_Movimientos::all();
        echo json_encode($detalle_movimiento);
        }catch(Exception $e){
            http_response_code(500);
            echo json_encode(["error" => 'Error al obtener los detalles de movimientos']);
        }
    }
}