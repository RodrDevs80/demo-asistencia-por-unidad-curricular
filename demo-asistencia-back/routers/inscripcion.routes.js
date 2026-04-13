import { Router } from "express";
import { listarInscripciones, obtenerInscripcionPorId, crearNuevaInscripcion, actualizarInscripcion, eliminarInscripcion, modificarEstadoDelAlumno } from "../controllers/inscripcion.controller.js"

const inscripcionRouter = Router();

// Obtener todas las inscripciones
inscripcionRouter.get("/inscripciones", listarInscripciones);

// Obtener una inscripción por ID
inscripcionRouter.get("/inscripciones/:id", obtenerInscripcionPorId);

// Crear una nueva inscripción (con validación de FK)
inscripcionRouter.post("/inscripciones", crearNuevaInscripcion);

// Actualizar completamente una inscripción (PUT) con validación de FK
inscripcionRouter.put("/inscripciones/:id", actualizarInscripcion);

// Eliminar una inscripción
inscripcionRouter.delete("/inscripciones/:id", eliminarInscripcion);

// Modificar solo el estado del alumno en la unidad curricular (PATCH)
inscripcionRouter.patch("/inscripciones/:id", modificarEstadoDelAlumno);

export default inscripcionRouter;