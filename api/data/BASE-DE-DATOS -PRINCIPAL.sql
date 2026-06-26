DROP DATABASE IF EXISTS sistemadealmacenamiento;
CREATE DATABASE sistemadealmacenamiento;
USE sistemadealmacenamiento;

-- 1. Creamos la tabla proveedores
CREATE TABLE proveedores(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nit_rut VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(100) NOT NULL,
    contacto_nombre VARCHAR(50),
    direccion VARCHAR(250),
    telefono VARCHAR(15),
    email VARCHAR(100)
)ENGINE=InnoDB;

-- 2. Creamos la tabla categorias
CREATE TABLE categorias(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(250)
)ENGINE=InnoDB;

-- 3. Creamos la tabla empleados
CREATE TABLE empleados(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    ci VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    cargo VARCHAR(50) NOT NULL
)ENGINE=InnoDB;

-- 4. Creamos la tabla usuarios (Relacionada directamente con Empleados)
CREATE TABLE usuarios(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Para almacenar la contraseña encriptada
    rol ENUM('ADMINISTRADOR', 'ALMACENERO', 'SUPERVISOR') NOT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1, -- 1 = Activo, 0 = Inactivo
    cod_empleado INT NOT NULL UNIQUE, -- Un empleado solo puede tener una cuenta de usuario
    FOREIGN KEY(cod_empleado) REFERENCES empleados(id) ON DELETE CASCADE
)ENGINE=InnoDB;

-- 5. Creamos la tabla ubicaciones (Almacenamiento físico)
CREATE TABLE ubicaciones(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    zona_sector VARCHAR(50) NOT NULL,
    pasillo VARCHAR(10) NOT NULL,
    estante VARCHAR(10) NOT NULL,
    nivel_balda VARCHAR(10) NOT NULL
)ENGINE=InnoDB;

-- 6. Creamos la tabla productos (Relacionada con Categorías y Ubicaciones)
CREATE TABLE productos(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    codbarras VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    stock_actual INT NOT NULL CHECK(stock_actual >= 0),
    stock_minimo INT NOT NULL DEFAULT 0 CHECK(stock_minimo >= 0),
    precio_costo DECIMAL(10,2) NOT NULL,
    cod_categoria INT NOT NULL,
    cod_ubicacion INT,
    FOREIGN KEY(cod_categoria) REFERENCES categorias(id),
    FOREIGN KEY(cod_ubicacion) REFERENCES ubicaciones(id)
)ENGINE=InnoDB;

-- 7. Creamos la tabla movimientos (Relacionada con Empleados y Proveedores)
CREATE TABLE movimientos(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    tipo_movimiento ENUM('ENTRADA', 'SALIDA', 'AJUSTE') NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT NOW(),
    documento_referencia VARCHAR(50),
    observaciones VARCHAR(250),
    cod_empleado INT NOT NULL,
    cod_proveedor INT,
    FOREIGN KEY(cod_empleado) REFERENCES empleados(id),
    FOREIGN KEY(cod_proveedor) REFERENCES proveedores(id)
)ENGINE=InnoDB;

-- 8. Creamos la tabla detalle_movimientos (Relaciona muchos a muchos Movimientos con Productos)
CREATE TABLE detalle_movimientos(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    cod_movimiento INT NOT NULL,
    cod_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK(cantidad > 0),
    precio_historico DECIMAL(10,2) NOT NULL,
    FOREIGN KEY(cod_movimiento) REFERENCES movimientos(id) ON DELETE CASCADE,
    FOREIGN KEY(cod_producto) REFERENCES productos(id)
)ENGINE=InnoDB;
