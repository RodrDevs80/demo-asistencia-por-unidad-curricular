import { Router } from "express";
import { listarAsistencias, obtenerAsistenciaPorId, crearAsistencia, actualizarAsistencia, obtenerAsistenciaDelAlumnoPorUnidadC, eliminarAsistencia, modificarEstadoAsistenciaDelAlumno } from "../controllers/asistencia.controller.js"


const asistenciaRouter = Router();

//listar todas las asistencias
asistenciaRouter.get("/asistencias", listarAsistencias);

// Obtener una asistencia por ID
asistenciaRouter.get("/asistencias/:id", obtenerAsistenciaPorId);

// Crear una nueva asistencia (con validación de FK)
asistenciaRouter.post("/asistencias", crearAsistencia);

// Actualizar completamente una asistencia (PUT) con validación de FK
asistenciaRouter.put("/asistencias/:id", actualizarAsistencia);

// Eliminar una asistencia
asistenciaRouter.delete("/asistencias/:id", eliminarAsistencia);

// Modificar solo el estado del alumno (PATCH)
asistenciaRouter.patch("/asistencias/:id", modificarEstadoAsistenciaDelAlumno);

// Obtener asistencia de cada alumno por unidad curricular
asistenciaRouter.get("/asistencias/alumno-uc/:idAlumno/:idUnidadCurricular", obtenerAsistenciaDelAlumnoPorUnidadC);

export default asistenciaRouter;