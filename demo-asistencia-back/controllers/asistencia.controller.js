import Alumno from "../models/Alumno.js";
import Asistencia from "../models/Asistencia.js";
import Inscripcion from "../models/Inscripcion.js";
import UnidadCurricular from "../models/UnidadCurricular.js";
import { calcularPorcentaje } from "../services/calcularPorcentaje.js";



//listar todas las asistencias
const listarAsistencias = async (req, res) => {
  try {
    const asistencias = await Asistencia.findAll();
    res.status(200).json({
      status: 200,
      message: asistencias.length === 0 ? 'No hay registros de asistencia' : 'Asistencias obtenidas exitosamente',
      data: asistencias,
      total: asistencias.length
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al obtener las asistencias",
      message: error.message
    });
  }
}

// Obtener una asistencia por ID
const obtenerAsistenciaPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const asistencia = await Asistencia.findByPk(id);
    if (!asistencia) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe asistencia con id: ${id}`
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Asistencia obtenida exitosamente',
      data: asistencia
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al obtener la asistencia",
      message: error.message
    });
  }
}

// Crear una nueva asistencia 
const crearAsistencia = async (req, res) => {
  try {
    const { idInscripcion, estadoDelAlumno, fechaDeClase } = req.body;

    if (!idInscripcion || !estadoDelAlumno) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'Los campos idInscripcion, idUnidadCurricular y estadoDelAlumno son requeridos'
      });
    }
    const nuevaAsistencia = await Asistencia.create({
      idInscripcion,
      estadoDelAlumno,
      fechaDeClase: fechaDeClase || new Date()
    });

    res.status(201).json({
      status: 201,
      message: 'Asistencia registrada exitosamente',
      data: nuevaAsistencia
    });
  } catch (error) {
    if (error.message?.startsWith('No existe inscripción') || error.message?.startsWith('No existe unidad curricular')) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: error.message
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        message: 'Error de validación',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({
      status: 500,
      error: "Error al crear la asistencia",
      message: error.message
    });
  }
}

// Actualizar completamente una asistencia (PUT) 
const actualizarAsistencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const asistencia = await Asistencia.findByPk(id);
    if (!asistencia) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe asistencia con id: ${id}`
      });
    }

    const { idInscripcion, idUnidadCurricular, estadoDelAlumno, fechaDeClase, numeroDeClase } = req.body;


    const camposActualizar = {};
    if (idInscripcion !== undefined) camposActualizar.idInscripcion = idInscripcion;
    if (idUnidadCurricular !== undefined) camposActualizar.idUnidadCurricular = idUnidadCurricular;
    if (estadoDelAlumno !== undefined) camposActualizar.estadoDelAlumno = estadoDelAlumno;
    if (fechaDeClase !== undefined) camposActualizar.fechaDeClase = fechaDeClase;
    if (numeroDeClase !== undefined) camposActualizar.numeroDeClase = numeroDeClase;

    await Asistencia.update(camposActualizar, { where: { id } });
    const asistenciaActualizada = await Asistencia.findByPk(id);

    res.status(200).json({
      status: 200,
      message: 'Asistencia actualizada exitosamente',
      data: asistenciaActualizada
    });
  } catch (error) {
    if (error.message?.startsWith('No existe inscripción') || error.message?.startsWith('No existe unidad curricular')) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: error.message
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        message: 'Error de validación',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({
      status: 500,
      error: "Error al actualizar la asistencia",
      message: error.message
    });
  }
}

// Eliminar una asistencia
const eliminarAsistencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const asistencia = await Asistencia.findByPk(id);
    if (!asistencia) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe asistencia con id: ${id}`
      });
    }

    await Asistencia.destroy({ where: { id } });
    res.status(200).json({
      status: 200,
      message: 'Asistencia eliminada exitosamente',
      data: asistencia
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al eliminar la asistencia",
      message: error.message
    });
  }
}

// Modificar solo el estado del alumno (PATCH)
const modificarEstadoAsistenciaDelAlumno = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const asistencia = await Asistencia.findByPk(id);
    if (!asistencia) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe asistencia con id: ${id}`
      });
    }

    const { estadoDelAlumno } = req.body;
    if (!estadoDelAlumno || !['presente', 'ausente'].includes(estadoDelAlumno)) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'El campo estadoDelAlumno es requerido y debe ser "presente" o "ausente"'
      });
    }

    await Asistencia.update({ estadoDelAlumno }, { where: { id } });
    const asistenciaActualizada = await Asistencia.findByPk(id);

    res.status(200).json({
      status: 200,
      message: 'Estado de asistencia modificado exitosamente',
      data: asistenciaActualizada
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al modificar el estado de asistencia",
      message: error.message
    });
  }
}

// Obtener asistencia de cada alumno por unidad curricular
const obtenerAsistenciaDelAlumnoPorUnidadC = async (req, res) => {
  try {
    const idAlumno = Number(req.params.idAlumno);
    const idUnidadCurricular = Number(req.params.idUnidadCurricular);

    if (isNaN(idAlumno) || idAlumno <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }
    if (isNaN(idUnidadCurricular) || idUnidadCurricular <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    //obtener la inscripción
    const inscripcion = await Inscripcion.findOne({
      where: { idAlumno, idUnidadCurricular }
    })

    if (!inscripcion) {
      return res.status(404).json({ mensaje: 'No se encontró el registro' });
    }

    const { id: idInscripcion } = inscripcion;

    const asistenciasPorRegistro = await Asistencia.findAll({
      where: { idInscripcion },
      order: [['fechaDeClase', 'DESC']]
    });

    if (!asistenciasPorRegistro.length === 0) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No registro de asistencia con el id proporcionado: ${idInscripcion}`
      });
    }

    //calcular Porcentaje de asistencia
    const cantidadPresentes = asistenciasPorRegistro.filter(a => a.estadoDelAlumno === "presente").length;
    const cantidadDeClases = asistenciasPorRegistro.length;

    const porcentaje = calcularPorcentaje(cantidadPresentes, cantidadDeClases);

    //obtener alumno
    const alumno = await Alumno.findByPk(idAlumno);
    const { dni, nombre: nombreAlumno, apellido } = alumno;
    const datosAlumno = { dni, nombreAlumno, apellido };
    //obtener unidad curricular
    const unidadCurricular = await UnidadCurricular.findByPk(idUnidadCurricular);
    const { nombre: nombreUC, curso } = unidadCurricular;
    const datosUC = { nombreUC, curso };

    res.status(200).json({
      status: 200,
      message: 'Asistencia por alumno y unidad curricular',
      data: { datosAlumno, datosUC, asistenciasPorRegistro, porcentaje }
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al obtener la asistencia",
      message: error.message
    });
  }
}


export { listarAsistencias, obtenerAsistenciaPorId, crearAsistencia, actualizarAsistencia, obtenerAsistenciaDelAlumnoPorUnidadC, eliminarAsistencia, modificarEstadoAsistenciaDelAlumno }