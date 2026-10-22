# Autenticación y roles

El acceso al frontend requiere una cuenta activa de `usuarios`. El formulario acepta el correo de acceso en `username`; la contraseña se compara con `password_hash` mediante `password_verify`, nunca se almacena en texto plano. En esta base el correo de acceso se guarda en `username`.

## Endpoints

| Método | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/auth/login` | Público; recibe `username` y `password`, devuelve un token |
| `GET` | `/auth/me` | Requiere token |
| `POST` | `/auth/logout` | Requiere token; revoca la sesión |

En las demás rutas, el cliente envía `Authorization: Bearer <token>`. Los tokens aleatorios se guardan como hash en `api_auth_tokens` y vencen después de ocho horas. La tabla se crea automáticamente al iniciar sesión por primera vez. El frontend conserva el token solo durante la sesión de la pestaña.

## Permisos

| Rol | Permisos |
| --- | --- |
| `ADMINISTRADOR` | Acceso completo de lectura, creación, edición y eliminación en todos los recursos. |
| `ALMACENERO` | Consulta productos, categorías, ubicaciones, empleados, proveedores y movimientos. Puede crear y editar productos, y registrar entradas/salidas y sus detalles. No puede registrar ajustes, borrar datos ni administrar usuarios. Los movimientos quedan asociados al empleado de su cuenta. |
| `SUPERVISOR` | Consulta productos, categorías, ubicaciones, empleados, proveedores, movimientos y detalles; puede revisar reportes y alertas. No puede modificar datos ni administrar usuarios. |

La API verifica estos permisos en cada ruta; ocultar controles en el frontend no es la única restricción. Al cambiar una cuenta desde la administración, se revocan sus tokens activos.
