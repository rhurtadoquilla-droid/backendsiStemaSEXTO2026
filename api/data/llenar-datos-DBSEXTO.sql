INSERT INTO clientes (ci, nombre, apellidos, direccion, telefono) VALUES
('1029384', 'Carlos', 'Mendoza Ortiz', 'Av. Las Américas No. 450', '71023456'),
('9283741', 'Ana María', 'Gutiérrez Roca', 'Calle Murillo, Edif. Central Piso 3', '60012345'),
('4738291', 'Jorge Luis', 'Suárez Justiniano', 'Barrio Equipetrol, Calle 7 Oeste', '77345678'),
('8372910', 'María René', 'Vargas Cuéllar', 'Urb. Los Pinos, Manzano 12, Lote 4', '65098765'),
('2938472', 'José Antonio', 'Rojas Salvatierra', 'Av. Bush, Calle Isuto No. 120', '72154321'),
('5829384', 'Claudia', 'Flores Mercado', 'Calle Ballivián No. 85', '70234567'),
('3829103', 'Fernando', 'Torres Camacho', 'Av. Banzer Km 5, Condominio Sevilla', '67712345'),
('7483920', 'Laura Elena', 'Méndez Pinto', 'Barrio Urbari, Calle Libertad No. 32', '71345678'),
('1928374', 'David', 'Castillo Aguilera', 'Av. Santos Dumont, Calle 4', '60898765'),
('8473921', 'Patricia', 'Luna Villagómez', 'Calle Sucre No. 510, Zona Central', '72234567'),
('6372819', 'Ricardo', 'Paz Hurtado', 'Av. San Martín, Edif. El Sol Apt. 4B', '77012345'),
('5263748', 'Gabriela', 'Sosa Ribera', 'Barrio Ramafa, Calle Los Tukis No. 15', '65432109'),
('9384726', 'Luis Fernando', 'Arce Céspedes', 'Av. Melchor Pinto No. 240', '71654321'),
('2837491', 'Sofía Natalia', 'Peña Dorado', 'Urb. Cotoca, Calle Las Palmas', '60712345'),
('4829104', 'Alejandro', 'Miranda Chávez', 'Av. Piraí, Octavo Anillo', '73145678'),
('3748291', 'Camila Paz', 'Guzmán Antelo', 'Calle Cochabamba No. 725', '69098765'),
('1827364', 'Mauricio', 'Salazar Beltrán', 'Barrio Polanco, Calle 3 No. 45', '71534567'),
('7382910', 'Daniela', 'Rada Arteaga', 'Av. Roque Aguilera, Tercer Anillo', '60912345'),
('6251439', 'Andrés', 'Villegas Mansilla', 'Calle Warnes No. 112', '78045678'),
('8291034', 'Valeria', 'Calderón Egüez', 'Urb. Las Palmas, Calle Los Tajibos', '65198765');


INSERT INTO empleados (ci, nombre, apellidos) VALUES
('5829103', 'Carlos Eduardo', 'Montaño Chávez'),
('2938471', 'Ana Belén', 'Gutiérrez Roca'),
('4738295', 'Juan Marcelo', 'Suárez Justiniano'),
('8372914', 'María Renée', 'Vargas Cuéllar'),
('2938411', 'José Luis', 'Rojas Salvatierra'),
('5829322', 'Claudia Patricia', 'Flores Mercado'),
('3829188', 'Luis Fernando', 'Torres Camacho'),
('7483955', 'Laura Elena', 'Méndez Pinto'),
('1928312', 'David Alejandro', 'Castillo Aguilera'),
('8473966', 'Patricia Alejandra', 'Luna Villagómez'),
('6372833', 'Ricardo Andrés', 'Paz Hurtado'),
('5263711', 'Gabriela Sofía', 'Sosa Ribera'),
('9384700', 'Jorge Antonio', 'Arce Céspedes'),
('2837422', 'Natalia Camila', 'Peña Dorado'),
('4829199', 'Alejandro Magno', 'Miranda Chávez'),
('3748255', 'Camila Victoria', 'Guzmán Antelo'),
('1827300', 'Mauricio Andrés', 'Salazar Beltrán'),
('7382944', 'Daniela Paola', 'Rada Arteaga'),
('6251455', 'Andrés Sebastian', 'Villegas Mansilla'),
('8291011', 'Valeria Inés', 'Calderón Egüez');


INSERT INTO productos (codbarras, descripcion, stock, precio_unitario) VALUES
('7791234567891', 'Aceite de Girasol 1L', 50, 15.50),
('7401234567892', 'Arroz Grano de Oro 1kg', 120, 8.50),
('7501234567893', 'Azúcar Blanca Refinada 1kg', 85, 6.00),
('7601234567894', 'Fideo Espagueti 400g', 200, 4.20),
('7701234567895', 'Leche Entera en Polvo 400g', 40, 28.00),
('7801234567896', 'Café Instantáneo 100g', 35, 22.50),
('7901234567897', 'Harina de Trigo 0000 1kg', 90, 7.00),
('7001234567898', 'Atún en Aceite 170g', 150, 11.50),
('7101234567899', 'Galletas de Agua Paquete Familiar', 65, 9.80),
('7201234567900', 'Refresco de Cola 2L', 110, 11.00),
('7301234567901', 'Detergente en Polvo 1kg', 45, 18.50),
('7401234567902', 'Jabón de Tocador 3 unidades', 75, 13.20),
('7501234567903', 'Champú Control Caspa 400ml', 25, 35.00),
('7601234567904', 'Papel Higiénico 4 rollos', 130, 8.00),
('7701234567905', 'Pasta Dental Protección Caries 90g', 60, 12.50),
('7801234567906', 'Mayonesa Doypack 250g', 80, 7.50),
('7901234567907', 'Salsa de Tomate 200g', 95, 4.80),
('7001234567908', 'Mantequilla con Sal 200g', 30, 14.00),
('7101234567909', 'Queso Edam Laminado 200g', 18, 24.50),
('7201234567910', 'Yogurt Frutado 1L', 40, 13.00);


SELECT * FROM clientes;
SELECT * FROM empleados;
SELECT * FROM productos;

INSERT INTO pedido (cod_cliente, fecha_compra, cantidad, cod_empleado) VALUES
(1, '2026-05-20 10:30:00', 3, 1),
(2, '2026-05-21 11:15:00', 5, 2),
(3, '2026-05-22 14:20:00', 2, 3),
(4, '2026-05-23 09:00:00', 8, 4),
(5, '2026-05-24 16:45:00', 4, 5),
(6, '2026-05-25 12:10:00', 1, 6),
(7, '2026-05-26 15:30:00', 6, 7),
(8, '2026-05-27 18:00:00', 2, 8),
(9, '2026-05-28 11:05:00', 7, 9),
(10, '2026-05-29 14:22:00', 3, 10);


INSERT INTO pedido_producto (cod_producto, cod_pedido, cantidad, precio_unitario, descuento) VALUES
(1, 1, 2, 15.50, 0.00),
(4, 1, 1, 4.20, 0.00),
(2, 2, 5, 8.50, 0.50),
(3, 3, 2, 6.00, 0.00),
(10, 4, 5, 11.00, 1.00),
(14, 4, 3, 8.00, 0.00),
(5, 5, 4, 28.00, 2.00),
(6, 6, 1, 22.50, 0.00),
(7, 7, 6, 7.00, 0.00),
(8, 8, 2, 11.50, 0.50);


INSERT INTO empleado_pedidos (cod_pedido, cod_empleado, fecha) VALUES
(1, 1, '2026-05-20'),
(2, 2, '2026-05-21'),
(3, 3, '2026-05-22'),
(4, 4, '2026-05-23'),
(5, 5, '2026-05-24'),
(6, 6, '2026-05-25'),
(7, 7, '2026-05-26'),
(8, 8, '2026-05-27'),
(9, 9, '2026-05-28'),
(10, 10, '2026-05-29');