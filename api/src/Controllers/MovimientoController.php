<?php
require_once "../src/Models/Movimientos.php";
class MovimientoController{
    public function getAll()
    {
        $movimiento=Movimientos::all();
        echo json_encode($movimiento);
         
    }
}