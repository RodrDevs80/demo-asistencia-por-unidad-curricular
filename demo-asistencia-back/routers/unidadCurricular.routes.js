import { Router } from "express";
import { activarDesactivarUnCu, actualizarUnidadCurricular, buscarUCporId, crearUnidadCurricular, eliminarUnidadCurricular, listarUnidadesCurriculares } from "../controllers/unidadCurricular.controller.js";

const unidadCurricularRouter = Router();

// Obtener todas las unidades curriculares (solo activas o todas según query)
unidadCurricularRouter.get("/unidades-curriculares", listarUnidadesCurriculares);

// Obtener una unidad curricular por ID
unidadCurricularRouter.get("/unidades-curriculares/:id", buscarUCporId);

// Crear una unidad curricular
unidadCurricularRouter.post("/unidades-curriculares", crearUnidadCurricular);

// Actualizar completamente una unidad curricular (PUT)
unidadCurricularRouter.put("/unidades-curriculares/:id", actualizarUnidadCurricular);

// Eliminar una unidad curricular (borrado físico)
unidadCurricularRouter.delete("/unidades-curriculares/:id", eliminarUnidadCurricular);

// Activar/desactivar una unidad curricular (PATCH)
unidadCurricularRouter.patch("/unidades-curriculares/:id", activarDesactivarUnCu);

export default unidadCurricularRouter;