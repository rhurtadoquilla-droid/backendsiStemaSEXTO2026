<?php
require_once "../src/models/Categorias.php";
class CategoriaController {
    public function getAll() {
        try{
        
        $categoria=Categorias::all();
        echo json_encode($categoria);
        }catch(Exception $e){
            http_response_code(500);
            echo json_encode(["error" => 'Error al obtener las categorias']);
        }
    }

    private function leerJson() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['estado' => 'false', 'message' => 'JSON inválido']);
            return null;
        }
        return $data;
    }

    private function responder($resultado, $mensaje) {
        if (isset($resultado['ERROR'])) {
            http_response_code(400);
            echo json_encode(['estado' => 'false', 'message' => $resultado['ERROR']]);
            return;
        }
        echo json_encode(['estado' => 'true', 'message' => $mensaje]);
    }

    public function add() {
        $data = $this->leerJson();
        if ($data === null) return;
        $this->responder(Categorias::add($data), 'Categoría creada correctamente');
    }

    public function update($id) {
        $data = $this->leerJson();
        if ($data === null) return;
        $this->responder(Categorias::update($id, $data), 'Categoría actualizada correctamente');
    }

    public function delete($id) {
        $this->responder(Categorias::delete($id), 'Categoría eliminada correctamente');
    }
}