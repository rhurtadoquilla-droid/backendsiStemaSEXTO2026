<?php
class ConexionPDO
{
    private static ?PDO $cnn=null;
    public static function coneect():PDO {
        $pdo='mysql:host='.HOST.'port='.PORT.';dbname='.DATABASE.';charset='.CHARSET;
        $options=[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
        pdo::ATTR_DEFAULT_FETCH_MODE=PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES=>false];
        try{
            self::$cnn=new PDO($pdo, USERNAME,PASSWORD,$options);
                       }catch(\PDOException $error)
            {
                die("ERROR ".$error->getMessage());
            }
            return self::$cnn;
    }
    public static function query(): array
    {
        try{
            return ["ok =>" "ok res"];
        } catch (Exception $e){
            return ["error" => $e->getMessage()];
        }
}
}