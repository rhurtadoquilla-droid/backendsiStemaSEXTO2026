<?php
require_once "../src/Config/conexionDB.php";

class ResourceController
{
    private function definitions(): array
    {
        return [
            'empleados' => [
                'columns' => ['id', 'ci', 'nombre', 'apellidos', 'cargo'],
                'fields' => [
                    'ci' => ['label' => 'CI', 'type' => 'text', 'required' => true, 'max' => 20],
                    'nombre' => ['label' => 'Nombre', 'type' => 'text', 'required' => true, 'max' => 50],
                    'apellidos' => ['label' => 'Apellidos', 'type' => 'text', 'required' => true, 'max' => 50],
                    'cargo' => ['label' => 'Cargo', 'type' => 'text', 'required' => true, 'max' => 50],
                ],
                'references' => [['usuarios', 'cod_empleado'], ['movimientos', 'cod_empleado']],
            ],
            'proveedores' => [
                'columns' => ['id', 'nit_rut', 'razon_social', 'contacto_nombre', 'direccion', 'telefono', 'email'],
                'fields' => [
                    'nit_rut' => ['label' => 'NIT / RUT', 'type' => 'text', 'required' => true, 'max' => 20],
                    'razon_social' => ['label' => 'Razón social', 'type' => 'text', 'required' => true, 'max' => 100],
                    'contacto_nombre' => ['label' => 'Nombre de contacto', 'type' => 'text', 'max' => 50, 'nullable' => true],
                    'direccion' => ['label' => 'Dirección', 'type' => 'text', 'max' => 250, 'nullable' => true],
                    'telefono' => ['label' => 'Teléfono', 'type' => 'text', 'max' => 15, 'nullable' => true],
                    'email' => ['label' => 'Correo', 'type' => 'email', 'max' => 100, 'nullable' => true],
                ],
                'references' => [['movimientos', 'cod_proveedor']],
            ],
            'ubicaciones' => [
                'columns' => ['id', 'zona_sector', 'pasillo', 'estante', 'nivel_balda'],
                'fields' => [
                    'zona_sector' => ['label' => 'Zona / sector', 'type' => 'text', 'required' => true, 'max' => 50],
                    'pasillo' => ['label' => 'Pasillo', 'type' => 'text', 'required' => true, 'max' => 10],
                    'estante' => ['label' => 'Estante', 'type' => 'text', 'required' => true, 'max' => 10],
                    'nivel_balda' => ['label' => 'Nivel / balda', 'type' => 'text', 'required' => true, 'max' => 10],
                ],
                'references' => [['productos', 'cod_ubicacion']],
            ],
            'movimientos' => [
                'columns' => ['id', 'tipo_movimiento', 'fecha_registro', 'documento_referencia', 'observaciones', 'cod_empleado', 'cod_proveedor'],
                'fields' => [
                    'tipo_movimiento' => ['label' => 'Tipo de movimiento', 'type' => 'select', 'required' => true, 'options' => ['ENTRADA', 'SALIDA', 'AJUSTE']],
                    'fecha_registro' => ['label' => 'Fecha', 'type' => 'datetime-local'],
                    'documento_referencia' => ['label' => 'Documento de referencia', 'type' => 'text', 'max' => 50, 'nullable' => true],
                    'observaciones' => ['label' => 'Observaciones', 'type' => 'textarea', 'max' => 250, 'nullable' => true],
                    'cod_empleado' => ['label' => 'Empleado', 'type' => 'relation', 'required' => true, 'endpoint' => '/empleados', 'optionLabel' => ['nombre', 'apellidos']],
                    'cod_proveedor' => ['label' => 'Proveedor', 'type' => 'relation', 'nullable' => true, 'endpoint' => '/proveedores', 'optionLabel' => ['razon_social']],
                ],
                'references' => [['detalle_movimientos', 'cod_movimiento']],
            ],
            'detalle_movimientos' => [
                'columns' => ['id', 'cod_movimiento', 'cod_producto', 'cantidad', 'precio_historico'],
                'fields' => [
                    'cod_movimiento' => ['label' => 'Movimiento', 'type' => 'relation', 'required' => true, 'endpoint' => '/movimientos', 'optionLabel' => ['id', 'tipo_movimiento', 'fecha_registro']],
                    'cod_producto' => ['label' => 'Producto', 'type' => 'relation', 'required' => true, 'endpoint' => '/productos', 'optionLabel' => ['nombre', 'codbarras']],
                    'cantidad' => ['label' => 'Cantidad', 'type' => 'number', 'required' => true, 'min' => 1, 'integer' => true],
                    'precio_historico' => ['label' => 'Precio histórico', 'type' => 'number', 'required' => true, 'min' => 0, 'step' => '0.01'],
                ],
                'references' => [],
            ],
            'usuarios' => [
                'columns' => ['id', 'username', 'rol', 'estado', 'cod_empleado'],
                'fields' => [
                    'username' => ['label' => 'Usuario', 'type' => 'text', 'required' => true, 'max' => 50],
                    'password' => ['label' => 'Contraseña', 'type' => 'password', 'required' => true, 'max' => 255],
                    'rol' => ['label' => 'Rol', 'type' => 'select', 'required' => true, 'options' => ['ADMINISTRADOR', 'ALMACENERO', 'SUPERVISOR']],
                    'estado' => ['label' => 'Estado', 'type' => 'select', 'required' => true, 'options' => ['1' => 'Activo', '0' => 'Inactivo']],
                    'cod_empleado' => ['label' => 'Empleado', 'type' => 'relation', 'required' => true, 'endpoint' => '/empleados', 'optionLabel' => ['nombre', 'apellidos']],
                ],
                'references' => [],
            ],
        ];
    }

    private function resourceName(): ?string
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '';
        $scriptPath = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
        if ($scriptPath !== '/' && substr($path, 0, strlen($scriptPath)) === $scriptPath) {
            $path = substr($path, strlen($scriptPath));
        }
        $segments = array_values(array_filter(explode('/', trim($path, '/')), 'strlen'));
        $name = $segments[0] ?? '';
        return array_key_exists($name, $this->definitions()) ? $name : null;
    }

    private function respondError(string $message, int $status): void
    {
        http_response_code($status);
        echo json_encode(['estado' => 'false', 'message' => $message]);
    }

    private function validate(array $definition, $data, bool $isUpdate): ?array
    {
        if (!is_array($data)) {
            $this->respondError('El cuerpo de la solicitud debe ser un objeto JSON.', 400);
            return null;
        }

        $fields = $definition['fields'];
        foreach ($data as $name => $value) {
            if (!array_key_exists($name, $fields)) {
                $this->respondError("El campo $name no está permitido.", 400);
                return null;
            }
        }

        $values = [];
        foreach ($fields as $name => $field) {
            if (!array_key_exists($name, $data)) {
                if (!empty($field['required']) && (!$isUpdate || $name !== 'password')) {
                    $this->respondError("El campo {$field['label']} es obligatorio.", 400);
                    return null;
                }
                continue;
            }

            $value = $data[$name];
            if ($value === '' || $value === null) {
                if (!empty($field['required']) && !($isUpdate && $name === 'password')) {
                    $this->respondError("El campo {$field['label']} es obligatorio.", 400);
                    return null;
                }
                if (!empty($field['nullable'])) {
                    $values[$name] = null;
                }
                continue;
            }

            if (isset($field['max']) && !preg_match('/^.{0,' . (int)$field['max'] . '}$/us', (string)$value)) {
                $this->respondError("El campo {$field['label']} supera la longitud permitida.", 400);
                return null;
            }
            if ($field['type'] === 'email' && filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
                $this->respondError("El campo {$field['label']} no contiene un correo válido.", 400);
                return null;
            }
            if ($field['type'] === 'number' && (!is_numeric($value) || (float)$value < (float)($field['min'] ?? 0))) {
                $this->respondError("El campo {$field['label']} tiene un valor inválido.", 400);
                return null;
            }
            if (!empty($field['integer']) && filter_var($value, FILTER_VALIDATE_INT) === false) {
                $this->respondError("El campo {$field['label']} debe ser un número entero.", 400);
                return null;
            }
            if ($field['type'] === 'relation' && (!ctype_digit((string)$value) || (int)$value < 1)) {
                $this->respondError("Selecciona un valor válido para {$field['label']}.", 400);
                return null;
            }
            if ($field['type'] === 'select' && !array_key_exists((string)$value, $field['options'])) {
                $options = array_values($field['options']);
                if (!in_array($value, $options, true)) {
                    $this->respondError("Selecciona un valor válido para {$field['label']}.", 400);
                    return null;
                }
            }
            if ($field['type'] === 'datetime-local') {
                $value = str_replace('T', ' ', (string)$value);
                if (strlen($value) === 16) {
                    $value .= ':00';
                }
                $date = DateTime::createFromFormat('Y-m-d H:i:s', $value);
                if (!$date || $date->format('Y-m-d H:i:s') !== $value) {
                    $this->respondError("La fecha del movimiento no es válida.", 400);
                    return null;
                }
            }
            if ($name === 'password') {
                $value = password_hash((string)$value, PASSWORD_DEFAULT);
            }
            $values[$name] = $value;
        }

        return $values;
    }

    public function getAll(): void
    {
        $name = $this->resourceName();
        if ($name === null) {
            $this->respondError('Tabla no encontrada.', 404);
            return;
        }

        try {
            $columns = implode(', ', $this->definitions()[$name]['columns']);
            $statement = ConexionPDO::connect()->query("SELECT $columns FROM $name");
            echo json_encode($statement->fetchAll());
        } catch (Throwable $error) {
            error_log($error->getMessage());
            $this->respondError('No se pudieron cargar los registros.', 500);
        }
    }

    public function add(): void
    {
        $this->save(null);
    }

    public function update($id): void
    {
        $this->save((int)$id);
    }

    private function save(?int $id): void
    {
        $name = $this->resourceName();
        if ($name === null) {
            $this->respondError('Tabla no encontrada.', 404);
            return;
        }
        $definition = $this->definitions()[$name];
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->respondError('JSON inválido.', 400);
            return;
        }
        $authenticatedUser = AuthController::currentUser();
        if ($name === 'movimientos' && $id === null && ($authenticatedUser['rol'] ?? '') === 'ALMACENERO') {
            if (!in_array($data['tipo_movimiento'] ?? null, ['ENTRADA', 'SALIDA'], true)) {
                $this->respondError('El almacenero solo puede registrar entradas y salidas.', 403);
                return;
            }
            if (empty($authenticatedUser['cod_empleado'])) {
                $this->respondError('Tu cuenta no está asociada a un empleado. Contacta al administrador.', 409);
                return;
            }
            $data['cod_empleado'] = $authenticatedUser['cod_empleado'];
        }
        $values = $this->validate($definition, $data, $id !== null);
        if ($values === null) {
            return;
        }

        try {
            $pdo = ConexionPDO::connect();
            if ($id !== null) {
                $existing = $pdo->prepare("SELECT id FROM $name WHERE id = :id");
                $existing->execute(['id' => $id]);
                if (!$existing->fetch()) {
                    $this->respondError('No se encontró el registro que quieres actualizar.', 404);
                    return;
                }
                $sets = [];
                foreach ($values as $field => $value) {
                    $column = $field === 'password' ? 'password_hash' : $field;
                    $sets[] = "$column = :$field";
                }
                if (!$sets) {
                    $this->respondError('No hay campos para actualizar.', 400);
                    return;
                }
                $values['id'] = $id;
                $statement = $pdo->prepare("UPDATE $name SET " . implode(', ', $sets) . ' WHERE id = :id');
                $statement->execute($values);
                if ($name === 'usuarios') {
                    $revoke = $pdo->prepare('DELETE FROM api_auth_tokens WHERE user_id = :user_id');
                    $revoke->execute(['user_id' => $id]);
                }
            } else {
                $columns = [];
                $placeholders = [];
                foreach ($values as $field => $value) {
                    $columns[] = $field === 'password' ? 'password_hash' : $field;
                    $placeholders[] = ':' . $field;
                }
                $statement = $pdo->prepare("INSERT INTO $name (" . implode(', ', $columns) . ') VALUES (' . implode(', ', $placeholders) . ')');
                $statement->execute($values);
                $id = (int)$pdo->lastInsertId();
            }
            echo json_encode(['estado' => 'true', 'message' => 'Registro guardado correctamente.', 'id' => $id]);
        } catch (PDOException $error) {
            error_log($error->getMessage());
            $this->respondError($error->getCode() === '23000'
                ? 'El dato ya existe o hace referencia a un registro inexistente.'
                : 'No se pudo guardar el registro.', $error->getCode() === '23000' ? 409 : 500);
        } catch (Throwable $error) {
            error_log($error->getMessage());
            $this->respondError('No se pudo guardar el registro.', 500);
        }
    }

    public function delete($id): void
    {
        $name = $this->resourceName();
        if ($name === null) {
            $this->respondError('Tabla no encontrada.', 404);
            return;
        }

        try {
            $pdo = ConexionPDO::connect();
            $pdo->beginTransaction();
            $statement = $pdo->prepare("SELECT id FROM $name WHERE id = :id FOR UPDATE");
            $statement->execute(['id' => $id]);
            if (!$statement->fetch()) {
                $pdo->rollBack();
                $this->respondError('No se encontró el registro.', 404);
                return;
            }

            foreach ($this->definitions()[$name]['references'] as [$table, $column]) {
                $check = $pdo->prepare("SELECT COUNT(*) FROM $table WHERE $column = :id");
                $check->execute(['id' => $id]);
                if ((int)$check->fetchColumn() > 0) {
                    $pdo->rollBack();
                    $this->respondError('No se puede eliminar: hay registros relacionados. Elimina o reasigna esos registros primero.', 409);
                    return;
                }
            }

            $delete = $pdo->prepare("DELETE FROM $name WHERE id = :id");
            $delete->execute(['id' => $id]);
            $pdo->commit();
            echo json_encode(['estado' => 'true', 'message' => 'Registro eliminado correctamente.']);
        } catch (PDOException $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log($error->getMessage());
            $this->respondError($error->getCode() === '23000'
                ? 'No se puede eliminar porque existen registros relacionados.'
                : 'No se pudo eliminar el registro.', $error->getCode() === '23000' ? 409 : 500);
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log($error->getMessage());
            $this->respondError('No se pudo eliminar el registro.', 500);
        }
    }
}
