import { Router } from "express";
import { actualizarAlumno, buscarAlumnoPorId, cambiarEstadoDelAlumnoPorId, crearAlumno, eliminarAlumno, listarAlumnos } from "../controllers/alumno.controller.js";

const alumnoRouter = Router();

alumnoRouter.get("/alumnos", listarAlumnos);

alumnoRouter.get("/alumnos/:id", buscarAlumnoPorId);

alumnoRouter.post("/alumnos", crearAlumno);

alumnoRouter.put("/alumnos/:id", actualizarAlumno);

alumnoRouter.delete("/alumnos/:id", eliminarAlumno);

alumnoRouter.patch("/alumnos/:id", cambiarEstadoDelAlumnoPorId);

export default alumnoRouter;



