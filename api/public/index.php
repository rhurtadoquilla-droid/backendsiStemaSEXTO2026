<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_filter(array_map('trim', explode(',', getenv('FRONTEND_ORIGINS') ?: 'http://www.sistemainv.com,https://www.sistemainv.com')));
$originHost = $origin ? parse_url($origin, PHP_URL_HOST) : '';
$isLocalOrigin = in_array($originHost, ['localhost', '127.0.0.1'], true);

if ($origin && (in_array($origin, $allowedOrigins, true) || $isLocalOrigin)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code($origin && !(in_array($origin, $allowedOrigins, true) || $isLocalOrigin) ? 403 : 204);
    exit;
}

require_once "../src/Router.php";
require_once "../src/Controllers/UserController.php";
require_once "../src/Controllers/ProductoController.php";
require_once "../src/Controllers/EmpleadoController.php";
require_once "../src/Controllers/CategoriaController.php";
require_once "../src/Controllers/MovimientoController.php";
require_once "../src/Controllers/UbicacionController.php";
require_once "../src/Controllers/ProveedorController.php";
require_once "../src/Controllers/Detalle_MovimientoController.php";
require_once "../src/Controllers/UsuarioController.php";
require_once "../src/Controllers/ResourceController.php";
require_once "../src/Controllers/AuthController.php";

use App\Router;

$route=new Router();
$route->add('POST','/auth/login','AuthController@login');
$route->add('GET','/auth/me','AuthController@current');
$route->add('POST','/auth/logout','AuthController@logout');
//direccion para usuarios
$route->add('GET','/','UserController@getAll');
$route->add('GET','/users','UserController@getAll'); 
//direcion de productos
$route->add('GET','/productos','ProductoController@getAll');
$route->add('PUT','/productos/{id}','ProductoController@update');
$route->add('POST','/productos','ProductoController@add');
$route->add('DELETE','/productos/{id}','ProductoController@delete');
//direccion de empleados
$route->add('GET','/empleados','ResourceController@getAll');
$route->add('POST','/empleados','ResourceController@add');
$route->add('PUT','/empleados/{id}','ResourceController@update');
$route->add('DELETE','/empleados/{id}','ResourceController@delete');
//direccion de categorias
$route->add('GET','/categorias','CategoriaController@getAll');
$route->add('POST','/categorias','CategoriaController@add');
$route->add('PUT','/categorias/{id}','CategoriaController@update');
$route->add('DELETE','/categorias/{id}','CategoriaController@delete');
//direccion de movimientos
$route->add('GET','/movimientos','ResourceController@getAll');
$route->add('POST','/movimientos','ResourceController@add');
$route->add('PUT','/movimientos/{id}','ResourceController@update');
$route->add('DELETE','/movimientos/{id}','ResourceController@delete');
//direccion de ubicaciones
$route->add('GET','/ubicaciones','ResourceController@getAll');
$route->add('POST','/ubicaciones','ResourceController@add');
$route->add('PUT','/ubicaciones/{id}','ResourceController@update');
$route->add('DELETE','/ubicaciones/{id}','ResourceController@delete');
//direccion de proveedores
$route->add('GET','/proveedores','ResourceController@getAll');
$route->add('POST','/proveedores','ResourceController@add');
$route->add('PUT','/proveedores/{id}','ResourceController@update');
$route->add('DELETE','/proveedores/{id}','ResourceController@delete');
//direccion de detalle de movimientos
$route->add('GET','/detalle_movimientos','ResourceController@getAll');
$route->add('POST','/detalle_movimientos','ResourceController@add');
$route->add('PUT','/detalle_movimientos/{id}','ResourceController@update');
$route->add('DELETE','/detalle_movimientos/{id}','ResourceController@delete');
//direccion de usuarios
$route->add('GET','/usuarios','ResourceController@getAll');
$route->add('POST','/usuarios','ResourceController@add');
$route->add('PUT','/usuarios/{id}','ResourceController@update');
$route->add('DELETE','/usuarios/{id}','ResourceController@delete');

$route->run();
