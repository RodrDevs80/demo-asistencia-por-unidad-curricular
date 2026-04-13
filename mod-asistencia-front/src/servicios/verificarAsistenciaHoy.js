import axios from "axios";

export const verificarAsistenciaHoy = async (idAlumno, idUnidadCurricular) => {
  try {
    // Obtener la fecha actual en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split("T")[0];

    const response = await axios.get(
      `http://localhost:3000/api/v1/asistencias/alumno-uc/${idAlumno}/${idUnidadCurricular}`
    );

    const asistencias = response.data.data.asistenciasPorRegistro || [];
    // Verificar si alguna asistencia tiene la fecha de hoy
    return asistencias.some((asistencia) => {
      const fechaAsistencia = new Date(asistencia.fechaDeClase)
        .toISOString()
        .split("T")[0];
      return fechaAsistencia === hoy;
    });
  } catch (error) {
    console.error("Error verificando asistencia:", error);
    return false;
  }
};
