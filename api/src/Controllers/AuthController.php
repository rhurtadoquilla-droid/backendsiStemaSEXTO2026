<?php

require_once __DIR__ . '/../Config/conexionDB.php';

class AuthController
{
    private static ?array $authenticatedUser = null;
    private static bool $authenticationChecked = false;

    private function respond(array $body, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($body);
    }

    private function ensureTokenTable(PDO $pdo): void
    {
        $pdo->exec("CREATE TABLE IF NOT EXISTS api_auth_tokens (
            token_hash CHAR(64) NOT NULL PRIMARY KEY,
            user_id INT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_api_auth_tokens_user (user_id),
            INDEX idx_api_auth_tokens_expiry (expires_at),
            CONSTRAINT fk_api_auth_tokens_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $identifier = is_array($data) ? trim((string)($data['username'] ?? '')) : '';
        $password = is_array($data) ? (string)($data['password'] ?? '') : '';

        if ($identifier === '' || $password === '' || strlen($identifier) > 254 || strlen($password) > 1024) {
            $this->respond(['message' => 'Ingresa tu correo electrónico y contraseña.'], 400);
            return;
        }

        try {
            $pdo = ConexionPDO::connect();
            $statement = $pdo->prepare('SELECT id, username, password_hash, rol, estado, cod_empleado FROM usuarios WHERE username = :username LIMIT 1');
            $statement->execute(['username' => $identifier]);
            $user = $statement->fetch(PDO::FETCH_ASSOC);

            if (!$user || (int)$user['estado'] !== 1 || !password_verify($password, $user['password_hash'])) {
                $this->respond(['message' => 'Correo o contraseña incorrectos.'], 401);
                return;
            }

            $this->ensureTokenTable($pdo);
            $pdo->exec('DELETE FROM api_auth_tokens WHERE expires_at <= NOW()');

            if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
                $rehash = $pdo->prepare('UPDATE usuarios SET password_hash = :password_hash WHERE id = :id');
                $rehash->execute([
                    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
                    'id' => $user['id'],
                ]);
            }

            $token = bin2hex(random_bytes(32));
            $saveToken = $pdo->prepare('INSERT INTO api_auth_tokens (token_hash, user_id, expires_at) VALUES (:token_hash, :user_id, DATE_ADD(NOW(), INTERVAL 8 HOUR))');
            $saveToken->execute([
                'token_hash' => hash('sha256', $token),
                'user_id' => $user['id'],
            ]);

            unset($user['password_hash'], $user['estado']);
            $this->respond(['token' => $token, 'user' => $user]);
        } catch (Throwable $error) {
            error_log($error->getMessage());
            $this->respond(['message' => 'No se pudo iniciar sesión. Verifica la conexión con la base de datos.'], 500);
        }
    }

    public function current(): void
    {
        $this->respond(['user' => self::currentUser()]);
    }

    public function logout(): void
    {
        try {
            $token = self::requestToken();
            if ($token !== null) {
                $statement = ConexionPDO::connect()->prepare('DELETE FROM api_auth_tokens WHERE token_hash = :token_hash');
                $statement->execute(['token_hash' => hash('sha256', $token)]);
            }
            $this->respond(['message' => 'Sesión cerrada correctamente.']);
        } catch (Throwable $error) {
            error_log($error->getMessage());
            $this->respond(['message' => 'No se pudo cerrar la sesión en el servidor.'], 500);
        }
    }

    public static function requestToken(): ?string
    {
        $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if ($authorization === '' && function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                if (strcasecmp($name, 'Authorization') === 0) {
                    $authorization = $value;
                    break;
                }
            }
        }
        return preg_match('/^Bearer\s+([a-f0-9]{64})$/i', $authorization, $matches) ? $matches[1] : null;
    }

    public static function currentUser(): ?array
    {
        if (self::$authenticationChecked) {
            return self::$authenticatedUser;
        }
        self::$authenticationChecked = true;

        $token = self::requestToken();
        if ($token === null) {
            return null;
        }

        $statement = ConexionPDO::connect()->prepare('
                SELECT u.id, u.username, u.rol, u.cod_empleado
                FROM api_auth_tokens t
                JOIN usuarios u ON u.id = t.user_id
                WHERE t.token_hash = :token_hash AND t.expires_at > NOW() AND u.estado = 1
                LIMIT 1
            ');
        $statement->execute(['token_hash' => hash('sha256', $token)]);
        self::$authenticatedUser = $statement->fetch(PDO::FETCH_ASSOC) ?: null;

        return self::$authenticatedUser;
    }

    public static function authorize(string $method, string $path): bool
    {
        if ($path === '/auth/login' && $method === 'POST') {
            return true;
        }

        try {
            $user = self::currentUser();
        } catch (Throwable $error) {
            error_log($error->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'No se pudo verificar la sesión.']);
            return false;
        }
        if ($user === null) {
            http_response_code(401);
            echo json_encode(['message' => 'Inicia sesión para continuar.']);
            return false;
        }

        if ($user['rol'] === 'ADMINISTRADOR') {
            return true;
        }
        if (($path === '/auth/me' && $method === 'GET') || ($path === '/auth/logout' && $method === 'POST')) {
            return true;
        }

        $resource = explode('/', trim($path, '/'))[0] ?? '';
        $readableByWarehouse = ['productos', 'categorias', 'ubicaciones', 'movimientos', 'detalle_movimientos', 'proveedores', 'empleados'];
        $readableBySupervisor = ['productos', 'categorias', 'ubicaciones', 'movimientos', 'detalle_movimientos', 'empleados', 'proveedores'];
        $allowed = false;

        if ($method === 'GET') {
            $allowed = $user['rol'] === 'ALMACENERO'
                ? in_array($resource, $readableByWarehouse, true)
                : ($user['rol'] === 'SUPERVISOR' && in_array($resource, $readableBySupervisor, true));
        } elseif ($user['rol'] === 'ALMACENERO') {
            $allowed = in_array($resource, ['productos'], true) && in_array($method, ['POST', 'PUT'], true);
            $allowed = $allowed || (in_array($resource, ['movimientos', 'detalle_movimientos'], true) && $method === 'POST');
        }

        if (!$allowed) {
            http_response_code(403);
            echo json_encode(['message' => 'Tu rol no tiene permiso para realizar esta acción.']);
        }
        return $allowed;
    }
}
