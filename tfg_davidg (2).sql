-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 10-02-2026 a las 07:35:06
-- Versión del servidor: 8.0.43-0ubuntu0.24.04.2
-- Versión de PHP: 8.4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tfg_davidg`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ausencias`
--

CREATE TABLE `ausencias` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `dias_totales` int DEFAULT '22',
  `dias_usados` int DEFAULT '0',
  `pendientes` int DEFAULT '22'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ausencias`
--

INSERT INTO `ausencias` (`id`, `usuario_id`, `dias_totales`, `dias_usados`, `pendientes`) VALUES
(1, 9, 28, 2, 26);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int NOT NULL,
  `empresa_id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `empresa_id`, `nombre`, `descripcion`, `created_at`) VALUES
(1, 4, 'Coches', '', '2026-02-09 10:40:01'),
(2, 4, 'General', 'Categoría por defecto', '2026-02-09 11:00:49'),
(3, 4, 'Electrónica', '', '2026-02-09 11:01:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_productos`
--

CREATE TABLE `categorias_productos` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int NOT NULL,
  `empresa_id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `nif` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_general_ci,
  `tipo_cliente` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'Residencial',
  `fecha_nacimiento` date DEFAULT NULL,
  `nacionalidad` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'España',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `empresa_id`, `nombre`, `nif`, `email`, `telefono`, `direccion`, `tipo_cliente`, `fecha_nacimiento`, `nacionalidad`, `fecha_registro`) VALUES
(1, 4, 'DAVID GUIJARRO CANO', '49601120X', 'davidquelmo@gmail.com', '628086490', 'Edificio San Edesio 2 B 11 2 2 11 - 46940, Manises (Valencia)', 'Residencial', NULL, 'España', '2026-02-05 09:33:55'),
(2, 4, 'Sarah Connor', '12345678Z', 'sarah@skynet.com', '666777888', 'Calle Falsa 123, Madrid', 'Empresa', NULL, 'España', '2026-02-05 09:33:55'),
(3, 4, 'Jose Perez', '11111111V', 'cliente@gmail.cm', '600000000', 'ewgjewgga', 'Residencial', NULL, 'España', '2026-02-09 07:23:34'),
(4, 4, 'Don David Guijarro', '49601120X', 'davidquelmo@gmail.com', '666666666', 'XFJ', 'Residencial', NULL, 'España', '2026-02-09 07:33:59'),
(5, 4, 'Jose SOcuellamoss', '49601120X', 'david@hotmail.com', '933662400', '<erherjdrejdzejderjd', 'Residencial', NULL, 'España', '2026-02-09 07:38:20'),
(6, 4, 'ola', '49601120X', 'zjzjjt', '666666666', 'egegeg', 'Residencial', NULL, 'España', '2026-02-09 07:44:23'),
(7, 4, 'forit', '49601120X', 'davidquelmo@gmail.com', '666666666', 'wffwfwfwf', 'Residencial', '2020-08-20', 'España', '2026-02-09 07:51:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `cif` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_general_ci,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `token_invitacion` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `nombre`, `cif`, `direccion`, `telefono`, `token_invitacion`, `fecha_creacion`) VALUES
(1, 'AAAAAAAAAAAAAAAAA', 'B12345678', 'bhjhkj', '666666666', 'NEXUS-F0BC', '2026-02-03 10:36:11'),
(2, 'SOLVAM', 'B12345678', 'WGWGEWGEGWG', '666666666', 'NEXUS-8447', '2026-02-03 10:36:30'),
(3, 'SOLVAM PORFAVOR', 'B12345678', 'FWFWFWFWFWF', '666666666', 'NEXUS-52E3', '2026-02-03 10:40:45'),
(4, 'Jose Socuellamos S.L', 'B12345678', 'SIX SEVEN', '666666666', 'NEXUS-9607', '2026-02-03 12:22:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fichajes`
--

CREATE TABLE `fichajes` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `empresa_id` int NOT NULL,
  `entrada` datetime NOT NULL,
  `salida` datetime DEFAULT NULL,
  `total_horas` decimal(5,2) DEFAULT '0.00',
  `ip_registro` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fichajes`
--

INSERT INTO `fichajes` (`id`, `usuario_id`, `empresa_id`, `entrada`, `salida`, `total_horas`, `ip_registro`) VALUES
(1, 9, 4, '2026-02-03 19:42:34', '2026-02-04 04:42:34', 9.00, NULL),
(2, 9, 4, '2026-02-04 19:42:34', '2026-02-05 03:42:34', 8.00, NULL),
(3, 9, 4, '2026-02-05 10:34:28', '2026-02-05 10:34:39', 0.00, NULL),
(4, 9, 4, '2026-02-05 10:34:44', '2026-02-05 10:35:47', 0.02, NULL),
(5, 9, 4, '2026-02-05 10:45:04', '2026-02-05 10:45:05', 0.00, NULL),
(6, 9, 4, '2026-02-05 12:28:06', '2026-02-05 12:29:11', 0.02, NULL),
(7, 9, 4, '2026-02-09 08:13:19', '2026-02-09 08:13:27', 0.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `nominas`
--

CREATE TABLE `nominas` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `mes` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `anio` int DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'Pagada',
  `archivo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT 'nomina.pdf'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `nominas`
--

INSERT INTO `nominas` (`id`, `usuario_id`, `mes`, `anio`, `estado`, `archivo`) VALUES
(1, 9, 'Septiembre', 2025, 'Pagada', 'nomina.pdf');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int NOT NULL,
  `empresa_id` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `sku` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo_barras` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `categoria` varchar(100) COLLATE utf8mb4_general_ci DEFAULT 'General',
  `precio_coste` decimal(10,2) DEFAULT '0.00',
  `precio_venta` decimal(10,2) DEFAULT '0.00',
  `impuesto` decimal(5,2) DEFAULT '21.00',
  `stock_actual` int DEFAULT '0',
  `stock_minimo` int DEFAULT '5',
  `imagen_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_general_ci DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `empresa_id`, `nombre`, `descripcion`, `sku`, `codigo_barras`, `categoria_id`, `categoria`, `precio_coste`, `precio_venta`, `impuesto`, `stock_actual`, `stock_minimo`, `imagen_url`, `estado`, `created_at`) VALUES
(1, 4, 'Auriculares BLACKBYTE', 'Auriculares Blackbyte de Pedro Buerbaum', 'PROD-991264', NULL, 2, 'General', 5.00, 10.00, 21.00, 20, 5, 'uploads/productos/1770634620_fd76631e34d855543c7e.jpg', 'activo', '2026-02-09 10:57:00'),
(2, 4, 'Auriculares guapardos', 'ola', 'PROD-690131', NULL, 3, 'General', 41.31, 49.99, 21.00, 20, 5, 'uploads/productos/1770635087_475858b7ea3ef87cd5c3.jpg', 'activo', '2026-02-09 11:04:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Administrador', 'Super Admin Global'),
(2, 'Encargado', 'Gestiona su propia empresa'),
(3, 'Empleado', 'Usuario básico de empresa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rol_id` int NOT NULL,
  `empresa_id` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol_id`, `empresa_id`, `fecha_creacion`) VALUES
(1, 'Jose Socuellamos', 'jose@nexus.com', '$2y$12$GaDfOg2YnuVAUH7qCBqVjuJvweaftHPjazidpD/dFdy9KJja0zHqe', 1, NULL, '2026-02-02 11:05:13'),
(2, 'Usuario Encargado', 'encargado@nexus.com', '$2y$12$GaDfOg2YnuVAUH7qCBqVjuJvweaftHPjazidpD/dFdy9KJja0zHqe', 2, 3, '2026-02-02 11:05:13'),
(3, 'David Guijarrín', 'david@nexus.com', '$2y$12$.OyZsj9wLJksvQcujWxn2.HqbfR02nqaEqH2bXKPmf9UNqRlNuSrW', 3, 3, '2026-02-03 10:53:09'),
(5, 'Luis del Pezo', 'ludapome@nexus.com', '$2y$12$3Zu6jnLEkNk1Ph3FKz52XOLqY6y/3yqUTR4mZpPPVz5Ctj2FSdVP2', 3, 3, '2026-02-03 11:40:51'),
(7, 'Davidín Guijarrín', 'davidin@nexus.com', 'ludapome', 2, NULL, '2026-02-03 11:45:55'),
(8, 'Jose Socuéllamos', 'josesocuellamos@nexus.com', '$2y$12$tXVwJvFOJtapgcXdWJQc8u5v0GEx4ucRHlGr/DUxDR1l12XxzwALK', 2, 4, '2026-02-03 12:21:41'),
(9, 'Trabajador de Jose', 'trabajadorjose@nexus.com', '$2y$12$MKnY5jY5E0Z1fYj/BMSyNeIIjy7c4XqGyaoG7pit9YIi.a/zWMTZy', 3, 4, '2026-02-03 12:43:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacaciones`
--

CREATE TABLE `vacaciones` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('solicitado','aprobado','denegado') COLLATE utf8mb4_general_ci DEFAULT 'solicitado',
  `comentarios` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vacaciones`
--

INSERT INTO `vacaciones` (`id`, `usuario_id`, `fecha_inicio`, `fecha_fin`, `estado`, `comentarios`) VALUES
(1, 9, '2026-02-16', '2026-02-23', 'solicitado', 'vacas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int NOT NULL,
  `empresa_id` int NOT NULL,
  `cliente_id` int NOT NULL,
  `codigo_transaccion` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `producto` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cantidad` int DEFAULT '1',
  `tienda_id` varchar(10) COLLATE utf8mb4_general_ci DEFAULT '8778',
  `fecha_venta` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'Cerrada',
  `total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `empresa_id`, `cliente_id`, `codigo_transaccion`, `producto`, `cantidad`, `tienda_id`, `fecha_venta`, `estado`, `total`) VALUES
(1, 4, 1, 'T010899760', 'UNISOPORTECOCHERED', 1, '8778', '2025-10-18 13:55:00', 'Cerrada', 15.00),
(2, 4, 1, 'T010895519', 'MANOBRA', 1, '8778', '2025-10-15 20:10:00', 'Cerrada', 30.00),
(3, 4, 1, 'T010833103', 'CABLELIGHTATIPOCBLANCO2M', 1, '8778', '2025-09-05 19:16:00', 'Cerrada', 12.50),
(4, 4, 1, 'T010778060', 'CCSXIAREDMI14CTRANS2A', 1, '8778', '2025-08-04 12:56:00', 'Cerrada', 250.00);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ausencias`
--
ALTER TABLE `ausencias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categorias_productos`
--
ALTER TABLE `categorias_productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `empresa_id` (`empresa_id`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_invitacion` (`token_invitacion`);

--
-- Indices de la tabla `fichajes`
--
ALTER TABLE `fichajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `fichajes_fk_empresa` (`empresa_id`);

--
-- Indices de la tabla `nominas`
--
ALTER TABLE `nominas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `rol_id` (`rol_id`),
  ADD KEY `empresa_id` (`empresa_id`);

--
-- Indices de la tabla `vacaciones`
--
ALTER TABLE `vacaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ausencias`
--
ALTER TABLE `ausencias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `categorias_productos`
--
ALTER TABLE `categorias_productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `fichajes`
--
ALTER TABLE `fichajes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `nominas`
--
ALTER TABLE `nominas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `vacaciones`
--
ALTER TABLE `vacaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `fichajes`
--
ALTER TABLE `fichajes`
  ADD CONSTRAINT `fichajes_fk_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fichajes_fk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_fk_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuarios_fk_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);

--
-- Filtros para la tabla `vacaciones`
--
ALTER TABLE `vacaciones`
  ADD CONSTRAINT `vacaciones_fk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
