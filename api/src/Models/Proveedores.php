<?php
include_once __DIR__."/../config/conexionDB.php";
class Proveedores
{
    public static function all()
    {
        $sql="SELECT * FROM proveedores ";
        return ConexionPDO::query($sql);
    }
}