import Alumno from "../models/Alumno.js";
import UnidadCurricular from "../models/UnidadCurricular.js";

// Función auxiliar para validar existencia de alumno y unidad curricular
//Esta va en inscripción
const validarFKA = async (idAlumno, idUnidadCurricular, transaction = null) => {
  if (idAlumno) {
    const alumno = await Alumno.findByPk(idAlumno, { transaction });
    if (!alumno) {
      throw new Error(`No existe alumno con id ${idAlumno}`);
    }
    // Opcional: verificar que el alumno esté activo
    if (!alumno.activo) throw new Error(`El alumno con id ${idAlumno} no está activo`);
  }
  if (idUnidadCurricular) {
    const uc = await UnidadCurricular.findByPk(idUnidadCurricular, { transaction });
    if (!uc) {
      throw new Error(`No existe unidad curricular con id ${idUnidadCurricular}`);
    }
  }
};


export { validarFKA }