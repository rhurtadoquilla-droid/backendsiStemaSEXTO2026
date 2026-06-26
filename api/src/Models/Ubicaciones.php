<?php
include_once __DIR__."/../config/conexionDB.php";
class Ubicaciones
{
    public static function all()
    {
        $sql="SELECT * FROM ubicaciones";
        return ConexionPDO::query($sql);
    }
}