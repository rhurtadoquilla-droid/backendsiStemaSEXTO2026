<?php
include_once __DIR__."/../config/conexionDB.php";
class Users
{
    private static $users=[
        ["id"=>1,"name"=>'puma gomez','email'=>"puma@gmail.com"],
        ["id"=>2,"name"=>'avril quispe','email'=>"avril@gmail.com"],
        ["id"=>3,"name"=>'koby nelson','email'=>"koby@gmail.com"],
        ["id"=>4,"name"=>'celeste padilla','email'=>"celeste@gmail.com"],
    ];
    public static function all(){
        $sql="SELECT * FROM usuarios";
        return ConexionPDO::query($sql);//self::$users;
    }
}