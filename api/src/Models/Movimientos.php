<?php
include_once __DIR__ . "/../Config/conexionDB.php";
class Movimientos
{
    public static function all()
    {
        $sql = "SELECT * FROM movimientos";
        return ConexionPDO::query($sql);
    }
}