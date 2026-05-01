<?php
class Users{
    private static $users=[
        ["id"=>1,"name"=>'Daniel Rosdriguez','email'=>"daniel@gmail.com"],
        ["id"=>2,"name"=>'Maria Lopez','email'=>"maria@gmail.com"],
        ["id"=>3,"name"=>'Calos Daniel','Ruiz'=>"carlos@gmail.com"],
         ["id"=>4,"name"=>'test','email'=>"daniel@gmail.com"],

        ];
    public static function all() {
       return self::$users;
    }
}