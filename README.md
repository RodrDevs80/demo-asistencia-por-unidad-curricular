# Sistema de Gestión de Asistencias

Aplicación completa para registrar y consultar asistencias de alumnos por unidad curricular. Incluye un backend REST API (Node.js + Express + Sequelize + MySQL) y un frontend moderno (React + Vite + TailwindCSS).

## Características principales

### Backend

- CRUD completo de **Alumnos**, **Unidades Curriculares**, **Inscripciones** y **Asistencias**.
- Validación de integridad referencial (claves foráneas) y reglas de negocio.
- Cálculo automático del `númeroDeClase` basado en la fecha de clase y la unidad curricular (usando hooks de Sequelize).
- Cálculo de porcentaje de asistencia por alumno y materia.
- Borrado lógico (`activo`) para alumnos y unidades curriculares; borrado físico para asistencias e inscripciones.
- Manejo de estados: `presente/ausente` en asistencias, `regular/libre` en inscripciones.
- Endpoints con respuestas JSON consistentes (códigos HTTP, mensajes, datos).
- Script de datos de prueba (`mock/datosDePrueba.sql`) para iniciar rápidamente.

### Frontend

- Interfaz responsiva y con modo oscuro (persistente en `localStorage`).
- Listado de unidades curriculares con botón "Tomar asistencia".
- Selección de unidad curricular para ver los alumnos inscriptos.
- Visualización de detalle de asistencia por alumno: fechas, número de clase, estado y porcentaje.
- Modal para tomar asistencia (un alumno a la vez) con verificación de asistencia duplicada en el día.
- Consumo de la API mediante Axios.

## Tecnologías utilizadas

| Backend          | Frontend      |
| ---------------- | ------------- |
| Node.js          | React 19      |
| Express 5        | Vite          |
| Sequelize (ORM)  | TailwindCSS 4 |
| MySQL2           | Axios         |
| Morgan (logging) | ESLint        |
| Cors, dotenv     |               |

## Requisitos previos

- Node.js (v18 o superior)
- MySQL (v8 recomendado)
- npm o yarn o pnpm

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sistema-asistencias.git
cd sistema-asistencias
```

````

### 2. Configurar la base de datos

Crea una base de datos en MySQL (por ejemplo `asistencia_db`).

### 3. Configurar variables de entorno (Backend)

Dentro de la carpeta `demo-asistencia-back/`, crea un archivo `.env` con el siguiente contenido (ajusta los valores):

```env
PORT=3000
DB_NAME=asistencia_db
DB_USER_M=root
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_DIALECT_M=mysql
```

> **Nota:** El frontend está configurado para conectar al backend en el puerto `3000`. Si usas otro puerto, modifica las URLs en `mod-asistencia-front/src/App.jsx` y los servicios.

### 4. Instalar dependencias del backend

```bash
cd demo-asistencia-back
npm install
```

### 5. Instalar dependencias del frontend

Abre otra terminal y navega al frontend:

```bash
cd mod-asistencia-front
npm install
```

## Ejecutar la aplicación

### Backend

```bash
cd demo-asistencia-back
npm run dev   # Modo desarrollo con recarga automática (--watch)
# o
npm start     # Modo producción
```

Al iniciar, Sequelize creará automáticamente las tablas en la base de datos (si no existen) gracias a `sequelize.sync({ force: false })`.
Verás en consola: `app de asistencia corriendo en http://localhost:3000`

### Frontend

```bash
cd mod-asistencia-front
npm run dev
```

El frontend se abrirá en `http://localhost:5173` (por defecto Vite).

### (Opcional) Cargar datos de prueba

Ejecuta el script SQL que se muestra en la sección **Datos de prueba** (más abajo) en tu base de datos. Asegúrate de cambiar `nombre_su_base_de_datos` por el nombre real de tu base de datos.

```bash
mysql -u root -p asistencia_db < ruta/al/script.sql
```

## Datos de prueba

Puedes poblar rápidamente la base de datos con el siguiente script SQL. Este inserta unidades curriculares, alumnos, inscripciones y asistencias de ejemplo.

```sql
-- ======================================================
-- Script de carga de datos de prueba
-- Basado en los modelos: Alumno, UnidadCurricular, Inscripción, Asistencia
-- ======================================================

-- 1. Limpiar tablas en orden inverso a las dependencias (para evitar errores de FK)
USE nombre_su_base_de_datos; -- Cambie por el nombre de su base de datos
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
```

## Estructura del proyecto

```
sistema-asistencias/
├── demo-asistencia-back/          # Backend
│   ├── config/
│   │   └── database/              # Conexión a DB
│   ├── controllers/               # Lógica de negocio
│   ├── models/                    # Modelos Sequelize
│   ├── routers/                   # Endpoints
│   ├── services/                  # Utilidades (cálculo %, validaciones)
│   ├── mock/                      # Datos de prueba (opcional)
│   ├── .env                       # Variables de entorno (crear)
│   ├── index.js                   # Punto de entrada
│   └── package.json
└── mod-asistencia-front/          # Frontend
    ├── src/
    │   ├── component/             # Componentes reutilizables
    │   ├── servicios/             # Llamadas a la API
    │   ├── App.jsx                # Componente principal
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Uso de la API (Endpoints principales)

Todos los endpoints están prefijados con `/api/v1`.

### Alumnos (`/alumnos`)

| Método | Ruta           | Descripción                         |
| ------ | -------------- | ----------------------------------- |
| GET    | `/alumnos`     | Listar alumnos activos              |
| GET    | `/alumnos/:id` | Obtener un alumno por ID            |
| POST   | `/alumnos`     | Crear alumno                        |
| PUT    | `/alumnos/:id` | Actualizar alumno (parcial o total) |
| DELETE | `/alumnos/:id` | Eliminar alumno (físico)            |
| PATCH  | `/alumnos/:id` | Cambiar estado `activo`             |

### Unidades Curriculares (`/unidades-curriculares`)

| Método | Ruta                     | Descripción                                 |
| ------ | ------------------------ | ------------------------------------------- |
| GET    | `/unidades-curriculares` | Listar (con query `?incluirInactivos=true`) |
| GET    | `/:id`                   | Obtener una UC                              |
| POST   | `/`                      | Crear UC                                    |
| PUT    | `/:id`                   | Actualizar UC                               |
| DELETE | `/:id`                   | Eliminar UC (físico)                        |
| PATCH  | `/:id`                   | Activar/desactivar UC                       |

### Inscripciones (`/inscripciones`)

| Método | Ruta             | Descripción                      |
| ------ | ---------------- | -------------------------------- |
| GET    | `/inscripciones` | Listar todas las inscripciones   |
| GET    | `/:id`           | Obtener una inscripción          |
| POST   | `/`              | Crear inscripción (valida FK)    |
| PUT    | `/:id`           | Actualizar inscripción           |
| DELETE | `/:id`           | Eliminar inscripción             |
| PATCH  | `/:id`           | Modificar estado (regular/libre) |

### Asistencias (`/asistencias`)

| Método | Ruta                                       | Descripción                                            |
| ------ | ------------------------------------------ | ------------------------------------------------------ |
| GET    | `/asistencias`                             | Listar todas las asistencias                           |
| GET    | `/:id`                                     | Obtener una asistencia                                 |
| POST   | `/`                                        | Registrar asistencia (valida FK)                       |
| PUT    | `/:id`                                     | Actualizar asistencia                                  |
| DELETE | `/:id`                                     | Eliminar asistencia                                    |
| PATCH  | `/:id`                                     | Modificar solo el estado presente/ausente              |
| GET    | `/alumno-uc/:idAlumno/:idUnidadCurricular` | Obtener asistencia + porcentaje de un alumno en una UC |

## Uso del frontend

1. Al abrir la aplicación, verás el listado de **Unidades Curriculares**.
2. Haz clic en **"Tomar asistencia"** para registrar la asistencia de los alumnos de esa UC (aparecerá un modal uno por uno).
   - El sistema evita registrar dos asistencias para el mismo alumno/UC en el mismo día.
3. En la sección inferior, selecciona una UC para ver los alumnos inscriptos.
4. Haz clic en **"Ver asistencia"** para consultar el detalle: fechas, número de clase, estado y porcentaje total de asistencia.
5. El botón de modo oscuro (🌙/☀️) en la esquina superior derecha permite cambiar el tema visual.

## Notas importantes

- **Numeración de clases**: El backend calcula automáticamente el campo `numeroDeClase` antes de insertar cada asistencia. Se asigna el siguiente número secuencial para la unidad curricular correspondiente, basado en fechas distintas. Esto permite tener un orden cronológico coherente incluso si se registran fuera de orden.
- **Verificación de asistencia diaria**: El frontend consulta si el alumno ya tiene una asistencia registrada el día actual para la misma UC antes de permitir marcar nueva.
- **Borrado lógico**: Los alumnos y unidades curriculares tienen el flag `activo`. Los endpoints por defecto solo muestran los activos, y se puede cambiar el estado con PATCH.
- **Inscripciones**: No se permite inscribir un alumno a una UC si el alumno o la UC están inactivos.
- **Validaciones**: Los modelos incluyen validaciones de formato (DNI, email, celular) y rangos (año de cursado entre 2015 y año actual+5).

## Posibles problemas y soluciones

- **Error de conexión a la base de datos**: Verifica que MySQL esté corriendo y que las credenciales del `.env` sean correctas.
- **El frontend no ve al backend**: Asegúrate de que el backend esté ejecutándose en el puerto esperado (por defecto 3000). Si cambiaste el puerto, actualiza las URLs en los archivos `App.jsx`, `obtenerAlumnoPorId.js`, `verificarAsistenciaHoy.js`.
- **Tablas no creadas**: Sequelize sincroniza automáticamente al iniciar. Si necesitas recrear las tablas desde cero, cambia temporalmente `{ force: true }` en `index.js` (cuidado: borra datos existentes).

## Licencia MIT

Copyright (c) 2026 Carlos E. Rodriguez

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia de este software y de los archivos de documentación asociados (el "Software"), para utilizar el Software sin restricción, incluyendo sin limitación los derechos de usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del Software, y para permitir a las personas a las que se les proporcione el Software a hacerlo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DEL COPYRIGHT SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑO U OTRA RESPONSABILIDAD, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRA FORMA, QUE SURJA DE O EN RELACIÓN CON EL SOFTWARE O EL USO U OTROS TIPOS DE ACCIONES EN EL SOFTWARE.

````
