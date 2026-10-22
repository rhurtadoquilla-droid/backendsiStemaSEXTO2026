<?php
include_once __DIR__."/../config/conexionDB.php";
class Usuarios
{
    public static function all()
    {
        $sql="SELECT id, username, rol, estado, cod_empleado FROM usuarios";
        return ConexionPDO::query($sql);
    }
}