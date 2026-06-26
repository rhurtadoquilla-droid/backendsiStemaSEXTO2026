DROP DATABASE IF EXISTS DBventa;
CREATE DATABASE DBventa;
USE DBventa;

-- creamos la tabla cliente
CREATE TABLE clientes(
    id int not null PRIMARY KEY auto_increment,
    ci VARCHAR(20) not null,
    nombre VARCHAR(50) not NULL,
    apellidos VARCHAR(50) not null,
    direccion VARCHAR(250),
    telefono VARCHAR(15)
)ENGINE=InnoDB;

-- creamos la tabla empleado
CREATE TABLE empleados(
    id int not null PRIMARY KEY auto_increment,
    ci VARCHAR(20) not null,
    nombre VARCHAR(50) not null,
    apellidos VARCHAR(50) not NULL
)ENGINE=InnoDB;

-- creamos la tabla pedido
CREATE TABLE pedido(
    id int not null PRIMARY KEY auto_increment,
    cod_cliente int not null,
    fecha_compra datetime not null,
    cantidad int not NULL,
    cod_empleado int not null,
    FOREIGN KEY (cod_cliente) REFERENCES clientes(id),
    FOREIGN KEY (cod_empleado) REFERENCES empleados(id)
)ENGINE=InnoDB;

CREATE TABLE productos(
    id INT NOT NULL PRIMARY KEY auto_increment,
    codbarras VARCHAR(100) not null,
    descripcion VARCHAR(100) not NULL,
    stock INT not null CHECK(stock>=0),
    precio_unitario DECIMAL(10,2) not null
)ENGINE=InnoDB;

-- creamos la tabla relacion pedidoProducto
CREATE TABLE pedido_producto(
    id INT NOT NULL PRIMARY KEY auto_increment,
    cod_producto int not null,
    cod_pedido int not null,
    cantidad int not null,
    precio_unitario DECIMAL(10,2) not null,
    descuento DECIMAL(10,2) DEFAULT(0.0),
    FOREIGN KEY(cod_producto) REFERENCES productos(id),
    FOREIGN KEY(cod_pedido) REFERENCES pedido(id)
)ENGINE=InnoDB;

-- creamos la tabla relacionar empleado-pedido
CREATE TABLE empleado_pedidos(
    cod_pedido int not null,
    cod_empleado int not null,
    fecha date not null DEFAULT(NOW()),
    PRIMARY KEY(cod_pedido,cod_empleado),
    FOREIGN KEY(cod_pedido) REFERENCES pedido(id),
    FOREIGN KEY(cod_empleado) REFERENCES empleados(id)
)ENGINE=InnoDB;