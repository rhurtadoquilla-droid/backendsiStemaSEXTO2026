-- Elimina la base de datos si existe
	DROP DATABASE IF EXISTS dbsistemadealmacenamiento;
	-- Creamos la base de datos
	CREATE DATABASE dbsistemadealmacenamiento;
	-- Usamos la base de datos DBSe xto2026
	USE dbsistemadealmacenamiento;
	-- crear tabla de usuario
	CREATE TABLE usuarios(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	nombreUsuario VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL
	)ENGINE=InnoDB;
	-- crea la tabla de imagenes
	CREATE TABLE imagenes(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	urlImagen VARCHAR(255) NOT NULL,
	usuarioId INT NOT NULL,
	CONSTRAINT fk_user_imagen FOREIGN KEY(usuarioId) REFERENCES usuarios(id)
	)ENGINE=InnoDB;
	
	-- adicionar datos a la tabla usuarios
	INSERT INTO usuarios(nombreUsuario,email,password)
	values('Roberto','Roberto@gmail.com','robert123');
	
	INSERT INTO usuarios(nombreUsuario,email,password)
	values('Maria','maria@gmail.com','maria123');
	
	INSERT INTO usuarios(nombreUsuario,email,password)
	values('puma','puma@gmail.com','puma123');
	
	-- modificar el nombre del usuario
	UPDATE usuarios SET nombreUsuario='Gabriel'
	WHERE id=1
	UPDATE usuarios SET email='Gabriel'
	WHERE id=1
	UPDATE usuarios SET nombreUsuario='Malue',email='Malue@gmail.com',password='malue123'
	WHERE id=2
	-- eliminar usuarios
	DELETE FROM usuarios
	WHERE id=2;
	
	--  mostrar los datos de una TABLESPACE
	    SELECT * FROM usuarios;
	
