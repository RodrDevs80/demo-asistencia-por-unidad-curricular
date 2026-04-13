-- ======================================================
-- Script de carga de datos de prueba
-- Basado en los modelos: Alumno, UnidadCurricular, Inscripción, Asistencia
-- ======================================================

-- 1. Limpiar tablas en orden inverso a las dependencias (para evitar errores de FK)
USE nombre_su_base_de_datos --Cambie por el nombre de su base de datos-
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE asistencia_alumno_uc;
TRUNCATE TABLE inscripcion;
TRUNCATE TABLE alumnos;
TRUNCATE TABLE unidades_curriculares;

SET FOREIGN_KEY_CHECKS = 1;

-- ======================================================
-- 2. Insertar Unidades Curriculares
-- ======================================================
INSERT INTO unidades_curriculares 
  (nombre, tipo, curso, division, periodo_lectivo, activo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Matemática I', 'materia', '1 año', 'A', 'anual', 1, NOW(), NOW()),
  ('Programación Web', 'taller', '2 año', 'B', 'cuatrimestral', 1, NOW(), NOW()),
  ('Inglés Técnico', 'seminario', '3 año', NULL, 'anual', 1, NOW(), NOW());

-- ======================================================
-- 3. Insertar Alumnos
-- ======================================================
INSERT INTO alumnos 
  (dni, nombre, apellido, email, celular, activo, fecha_creacion, fecha_actualizacion)
VALUES
  ('12345678', 'Juan', 'Pérez', 'juan.perez@example.com', '1155551111', 1, NOW(), NOW()),
  ('23456789', 'María', 'Gómez', 'maria.gomez@example.com', '1166662222', 1, NOW(), NOW()),
  ('34567890', 'Carlos', 'López', 'carlos.lopez@example.com', '1177773333', 1, NOW(), NOW());

-- ======================================================
-- 4. Insertar Inscripciones (relación alumno - unidad curricular)
-- ======================================================
INSERT INTO inscripcion 
  (id_alumno, id_unidad_curricular, anio_cursado, estado_alumno_unidad_curricular, fecha_creacion, fecha_actualizacion)
VALUES
  (1, 1, 2025, 'regular', NOW(), NOW()),   -- Juan cursa Matemática I
  (1, 2, 2025, 'regular', NOW(), NOW()),   -- Juan cursa Programación Web
  (2, 1, 2025, 'regular', NOW(), NOW()),   -- María cursa Matemática I
  (2, 3, 2025, 'libre',   NOW(), NOW()),   -- María cursa Inglés Técnico (libre)
  (3, 2, 2025, 'regular', NOW(), NOW());   -- Carlos cursa Programación Web

-- ======================================================
-- 5. Insertar Asistencias
-- (Se asigna número de clase incremental por inscripción según fecha)
-- ======================================================

-- Para Inscripción 1 (Juan - Matemática I)
INSERT INTO asistencia_alumno_uc 
  (id_inscripcion, estado_alumno, fecha_de_clase, numero_de_clase)
VALUES
  (1, 'presente', '2025-03-10 08:00:00', 1),
  (1, 'presente', '2025-03-17 08:00:00', 2),
  (1, 'ausente',  '2025-03-24 08:00:00', 3),
  (1, 'presente', '2025-03-31 08:00:00', 4);

-- Para Inscripción 2 (Juan - Programación Web)
INSERT INTO asistencia_alumno_uc 
  (id_inscripcion, estado_alumno, fecha_de_clase, numero_de_clase)
VALUES
  (2, 'presente', '2025-03-11 14:00:00', 1),
  (2, 'presente', '2025-03-18 14:00:00', 2),
  (2, 'presente', '2025-03-25 14:00:00', 3);

-- Para Inscripción 3 (María - Matemática I)
INSERT INTO asistencia_alumno_uc 
  (id_inscripcion, estado_alumno, fecha_de_clase, numero_de_clase)
VALUES
  (3, 'presente', '2025-03-10 08:00:00', 1),
  (3, 'ausente',  '2025-03-17 08:00:00', 2),
  (3, 'presente', '2025-03-24 08:00:00', 3);

-- Para Inscripción 4 (María - Inglés Técnico)
INSERT INTO asistencia_alumno_uc 
  (id_inscripcion, estado_alumno, fecha_de_clase, numero_de_clase)
VALUES
  (4, 'presente', '2025-03-12 10:00:00', 1),
  (4, 'presente', '2025-03-19 10:00:00', 2);

-- Para Inscripción 5 (Carlos - Programación Web)
INSERT INTO asistencia_alumno_uc 
  (id_inscripcion, estado_alumno, fecha_de_clase, numero_de_clase)
VALUES
  (5, 'presente', '2025-03-11 14:00:00', 1),
  (5, 'ausente',  '2025-03-18 14:00:00', 2),
  (5, 'presente', '2025-03-25 14:00:00', 3),
  (5, 'presente', '2025-04-01 14:00:00', 4);

-- ======================================================
-- Fin del script
-- ======================================================