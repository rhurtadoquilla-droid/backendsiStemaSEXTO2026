<?php
include_once __DIR__."/../config/conexionDB.php";
class Detalle_Movimientos
{
    public static function all()
    {
        $sql="SELECT * FROM detalle_movimientos";
        return ConexionPDO::query($sql);
    }
}