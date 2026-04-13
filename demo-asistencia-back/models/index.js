import sequelize from "../config/database/conexion.js";
import Alumno from "./Alumno.js";
import UnidadCurricular from "./UnidadCurricular.js";
import Asistencia from "./Asistencia.js";
import Inscripcion from "./Inscripcion.js";

//Relaciones
//Alumno N:M UnidadCurricular -> tabla intermedia: Inscripción
Alumno.hasMany(Inscripcion, {
  foreignKey: "idAlumno"
})
Inscripcion.belongsTo(Alumno, {
  foreignKey: "idAlumno"
})
UnidadCurricular.hasMany(Inscripcion, {
  foreignKey: "idUnidadCurricular"
})
Inscripcion.belongsTo(UnidadCurricular, {
  foreignKey: "idUnidadCurricular"
})
//Inscripción 1 : N Asistencia -> una inscripción genera muchos registros de asistencia.
Inscripcion.hasMany(Asistencia, {
  foreignKey: "idInscripcion"
})
Asistencia.belongsTo(Inscripcion, {
  foreignKey: "idInscripcion",
  as: 'inscripcion'
})


export { sequelize };