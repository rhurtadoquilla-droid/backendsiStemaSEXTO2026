-- ====================================================================
-- SCRIPT DE LLENADO COMPLETO PARA TODAS LAS TABLAS (EMPRESA DE MUEBLES)
-- ====================================================================

-- 1. LLENAR TABLA: proveedores (Abastecedores de madera, telas y herrajes)
INSERT INTO proveedores (nit_rut, razon_social, contacto_nombre, direccion, telefono, email) VALUES
('NIT-900111222', 'Maderas del Oriente S.A.', 'Carlos Mendoza', 'Av. Forestal #450, Parque Industrial', '71234567', 'ventas@maderasoriente.com'),
('NIT-900333444', 'Herrajes e Importaciones Express', 'Ana María Ruiz', 'Calle Industrial #12, Zona Central', '72345678', 'contacto@herrajesexpress.com'),
('NIT-900555666', 'Textiles y Cueros del Sur', 'Jorge Ramos', 'Av. Las Américas Lote 8', '73456789', 'jramos@textilesdelsur.com'),
('NIT-900777888', 'Distribuidora de Vidrios San Miguel', 'Lucía Fernández', 'Calle Murillo #88', '74567890', 'lfernandez@vidriossanmiguel.com'),
('NIT-900999000', 'Pinturas y Barnices del Valle', 'Pedro Gómez', 'Z. Industrial Norte Nro 10', '75678901', 'pgomez@pinturasvalle.com');

-- 2. LLENAR TABLA: categorias (Tipos de muebles y materiales)
INSERT INTO categorias (nombre, descripcion) VALUES
('Dormitorio', 'Camas, roperos, veladores, cómodas y respaldos'),
('Sala de Estar', 'Sofás, sillones, mesas de centro, racks y muebles de TV'),
('Comedor', 'Mesas de comedor, sillas, vitrinas y aparadores'),
('Oficina', 'Escritorios, cajoneras, sillas ejecutivas y libreros'),
('Materia Prima', 'Tableros de madera, melamina, herrajes, barnices y telas');

-- 3. LLENAR TABLA: empleados (Personal operativo del almacén y taller)
INSERT INTO empleados (ci, nombre, apellidos, cargo) VALUES
('11022033', 'Roberto', 'Hurtado Quilla', 'ADMINISTRADOR'),
('44055066', 'Juan Carlos', 'Mamani Flores', 'ALMACENERO'),
('77088099', 'María Elena', 'Gómez Castro', 'SUPERVISOR'),
('99011022', 'Carlos', 'Andrade Ríos', 'JEFE DE TALLER'),
('55044033', 'Luis Fernando', 'Pinto Suárez', 'ALMACENERO AUXILIAR');

-- 4. LLENAR TABLA: usuarios (Cuentas de acceso para el sistema)
INSERT INTO usuarios (username, password_hash, rol, estado, cod_empleado) VALUES
('roberto.admin', '$2b$10$SimulatedHashForRobertoAdmin123456789', 'ADMINISTRADOR', 1, 1),
('juan.almacen', '$2b$10$SimulatedHashForJuanAlmacen123456789', 'ALMACENERO', 1, 2),
('maria.super', '$2b$10$SimulatedHashForMariaSupervisor12345', 'SUPERVISOR', 1, 3);

-- 5. LLENAR TABLA: ubicaciones (Espacios físicos dentro del almacén)
INSERT INTO ubicaciones (zona_sector, pasillo, estante, nivel_balda) VALUES
('Sector Muebles Pesados', 'Pasillo A', 'Estante 01', 'Nivel Suelo'),
('Sector Muebles Medianos', 'Pasillo B', 'Estante 04', 'Nivel 2'),
('Sector Herrajes y Accesorios', 'Pasillo C', 'Estante 02', 'Nivel 3'),
('Sector Tapicería y Telas', 'Pasillo D', 'Estante 01', 'Nivel 1'),
('Patio de Maderas', 'Pasillo E', 'Estante Sl-1', 'Nivel Suelo');

-- 6. LLENAR TABLA: productos (Muebles listos e insumos de inventario)
INSERT INTO productos (codbarras, nombre, descripcion, stock_actual, stock_minimo, precio_costo, cod_categoria, cod_ubicacion) VALUES
('750123456001', 'Sofá Cama 3 Cuerpos Gris', 'Sofá tapizado en tela lino de alta resistencia', 5, 2, 1200.00, 2, 1),
('750123456002', 'Mesa Comedor Madera Roble', 'Mesa rectangular para 6 personas de madera maciza', 3, 1, 1800.00, 3, 1),
('750123456003', 'Silla Comedor Tapizada', 'Silla de madera con asiento acolchado color beige', 12, 4, 250.00, 3, 2),
('750123456004', 'Ropero Empotrado 4 Puertas', 'Ropero de melamina color madera nogal con espejos', 2, 1, 2200.00, 1, 1),
('750123456005', 'Escritorio Ergonómico L', 'Escritorio de oficina con pasacables y cajonera', 4, 2, 650.00, 4, 2),
('750123456006', 'Tablero Melamina Nogal 18mm', 'Insumo para fabricación de estructuras de muebles', 40, 10, 180.00, 5, 5),
('750123456007', 'Caja Correderas Telescópicas 40cm', 'Rieles metálicos para cajones de escritorios y roperos', 15, 5, 45.00, 5, 3),
('750123456008', 'Cama Matrimonial King Size', 'Estructura de cama en madera tajibo con soporte reforzado', 3, 1, 2500.00, 1, 1);

-- 7. LLENAR TABLA: movimientos (Registros de flujos de inventario internos y externos)
INSERT INTO movimientos (tipo_movimiento, fecha_registro, documento_referencia, observaciones, cod_empleado, cod_proveedor) VALUES
('ENTRADA', NOW(), 'FAC-8991', 'Ingreso por compra de tableros y rieles metálicos', 2, 1),
('ENTRADA', NOW(), 'NOTA-PROD-001', 'Ingreso de productos terminados desde el taller de carpintería', 2, NULL),
('AJUSTE', NOW(), 'INF-ROT-04', 'Pérdida por daño estructural en el pasillo (rotura de pata de mesa)', 3, NULL),
('SALIDA', NOW(), 'SOL-TALLER-02', 'Salida interna de melamina y herrajes requeridos por producción', 5, NULL),
('ENTRADA', NOW(), 'REMISION-9941', 'Compra de rollos de tela lino para stock de tapicería', 2, 3);

-- 8. LLENAR TABLA: detalle_movimientos (Vinculación exacta de productos y cantidades por movimiento)
INSERT INTO detalle_movimientos (cod_movimiento, cod_producto, cantidad, precio_historico) VALUES
(1, 6, 20, 180.00), -- Mov 1: Entraron 20 tableros de melamina
(1, 7, 10, 45.00),  -- Mov 1: Entraron 10 cajas de correderas telesópicas
(2, 1, 5, 1200.00), -- Mov 2: Entraron 5 sofás terminados de producción
(2, 5, 4, 650.00),  -- Mov 2: Entraron 4 escritorios terminados de producción
(3, 2, 1, 1800.00), -- Mov 3: Se dio de baja 1 mesa de roble dañada (Ajuste)
(4, 6, 5, 180.00),  -- Mov 4: Salieron hacia el taller 5 tableros de melamina
(5, 3, 12, 250.00); -- Mov 5: Entraron 12 sillas de comedor tapizadas
