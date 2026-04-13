import Inscripcion from "../models/Inscripcion.js";
import { validarFKA } from "../services/validacionesFK.js";

// Obtener todas las inscripciones
const listarInscripciones = async (req, res) => {
  try {
    const inscripciones = await Inscripcion.findAll();
    res.status(200).json({
      status: 200,
      message: inscripciones.length === 0 ? 'No hay inscripciones registradas' : 'Inscripciones obtenidas exitosamente',
      data: inscripciones,
      total: inscripciones.length
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al obtener las inscripciones",
      message: error.message
    });
  }
}

// Obtener una inscripción por ID
const obtenerInscripcionPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const inscripcion = await Inscripcion.findByPk(id);
    if (!inscripcion) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe inscripción con id: ${id}`
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Inscripción obtenida exitosamente',
      data: inscripcion
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al obtener la inscripción",
      message: error.message
    });
  }
}

// Crear una nueva inscripción (con validación de FK)
const crearNuevaInscripcion = async (req, res) => {
  try {
    const { idAlumno, idUnidadCurricular, anioCursado, estadoAlumnoUnidadC } = req.body;

    if (!idAlumno || !idUnidadCurricular || !anioCursado) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'Los campos idAlumno, idUnidadCurricular y anioCursado son requeridos'
      });
    }

    // Validar existencia de las referencias
    await validarFKA(idAlumno, idUnidadCurricular);

    const nuevaInscripcion = await Inscripcion.create({
      idAlumno,
      idUnidadCurricular,
      anioCursado,
      estadoAlumnoUnidadC: estadoAlumnoUnidadC || 'regular'
    });

    res.status(201).json({
      status: 201,
      message: 'Inscripción creada exitosamente',
      data: nuevaInscripcion
    });
  } catch (error) {
    if (error.message?.startsWith('No existe alumno') || error.message?.startsWith('No existe unidad curricular')) {
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
      error: "Error al crear la inscripción",
      message: error.message
    });
  }
}

// Actualizar completamente una inscripción (PUT) con validación de FK
const actualizarInscripcion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const inscripcion = await Inscripcion.findByPk(id);
    if (!inscripcion) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe inscripción con id: ${id}`
      });
    }

    const { idAlumno, idUnidadCurricular, anioCursado, estadoAlumnoUnidadC } = req.body;

    // Validar FK si se proporcionan y cambian
    if (idAlumno && idAlumno !== inscripcion.idAlumno) {
      await validarFK(idAlumno, null);
    }
    if (idUnidadCurricular && idUnidadCurricular !== inscripcion.idUnidadCurricular) {
      await validarFK(null, idUnidadCurricular);
    }

    const camposActualizar = {};
    if (idAlumno !== undefined) camposActualizar.idAlumno = idAlumno;
    if (idUnidadCurricular !== undefined) camposActualizar.idUnidadCurricular = idUnidadCurricular;
    if (anioCursado !== undefined) camposActualizar.anioCursado = anioCursado;
    if (estadoAlumnoUnidadC !== undefined) camposActualizar.estadoAlumnoUnidadC = estadoAlumnoUnidadC;

    await Inscripcion.update(camposActualizar, { where: { id } });
    const inscripcionActualizada = await Inscripcion.findByPk(id);

    res.status(200).json({
      status: 200,
      message: 'Inscripción actualizada exitosamente',
      data: inscripcionActualizada
    });
  } catch (error) {
    if (error.message?.startsWith('No existe alumno') || error.message?.startsWith('No existe unidad curricular')) {
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
      error: "Error al actualizar la inscripción",
      message: error.message
    });
  }
}

// Eliminar una inscripción
const eliminarInscripcion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const inscripcion = await Inscripcion.findByPk(id);
    if (!inscripcion) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe inscripción con id: ${id}`
      });
    }

    await Inscripcion.destroy({ where: { id } });
    res.status(200).json({
      status: 200,
      message: 'Inscripción eliminada exitosamente',
      data: inscripcion
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al eliminar la inscripción",
      message: error.message
    });
  }
}

// Modificar solo el estado del alumno en la unidad curricular (PATCH)
const modificarEstadoDelAlumno = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const inscripcion = await Inscripcion.findByPk(id);
    if (!inscripcion) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe inscripción con id: ${id}`
      });
    }

    const { estadoAlumnoUnidadC } = req.body;
    if (!estadoAlumnoUnidadC || !['regular', 'libre'].includes(estadoAlumnoUnidadC)) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'El campo estadoAlumnoUnidadC es requerido y debe ser "regular" o "libre"'
      });
    }

    await Inscripcion.update({ estadoAlumnoUnidadC }, { where: { id } });
    const inscripcionActualizada = await Inscripcion.findByPk(id);

    res.status(200).json({
      status: 200,
      message: 'Estado del alumno en la unidad curricular modificado exitosamente',
      data: inscripcionActualizada
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al modificar el estado del alumno",
      message: error.message
    });
  }
}

export { listarInscripciones, obtenerInscripcionPorId, crearNuevaInscripcion, actualizarInscripcion, eliminarInscripcion, modificarEstadoDelAlumno };