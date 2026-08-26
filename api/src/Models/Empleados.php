<?php
include_once __DIR__."/../config/conexionDB.php";
class Empleados
{
    public static function all()
    {
        $sql="SELECT * FROM empleados";
        return ConexionPDO::query($sql);
    }
}