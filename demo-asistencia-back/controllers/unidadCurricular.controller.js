import UnidadCurricular from "../models/UnidadCurricular.js";


const listarUnidadesCurriculares = async (req, res) => {
  try {
    const { incluirInactivos } = req.query;
    const where = {};
    if (incluirInactivos !== 'true') {
      where.activo = true;
    }

    const unidades = await UnidadCurricular.findAll({ where });
    res.status(200).json({
      status: 200,
      message: unidades.length === 0 ? 'No hay unidades curriculares' : 'Unidades curriculares obtenidas exitosamente',
      data: unidades,
      total: unidades.length
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al obtener las unidades curriculares",
      message: error.message
    });
  }
}

const buscarUCporId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const unidad = await UnidadCurricular.findByPk(id);
    if (!unidad) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe unidad curricular con id: ${id}`
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Unidad curricular obtenida exitosamente',
      data: unidad
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al obtener la unidad curricular",
      message: error.message
    });
  }
}

const crearUnidadCurricular = async (req, res) => {
  try {
    const { nombre, tipo, curso, division, periodoLectivo } = req.body;

    if (!nombre || !tipo || !curso || !periodoLectivo) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'Los campos nombre, tipo, curso y periodoLectivo son requeridos'
      });
    }

    const nuevaUnidad = await UnidadCurricular.create({
      nombre,
      tipo,
      curso,
      division,
      periodoLectivo,
      activo: true
    });

    res.status(201).json({
      status: 201,
      message: 'Unidad curricular creada exitosamente',
      data: nuevaUnidad
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 400,
        title: 'Validation Error',
        message: 'Error de validación',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 400,
        title: 'Duplicate Error',
        message: 'Ya existe una unidad curricular con ese nombre'
      });
    }
    res.status(500).json({
      status: 500,
      error: "Error al crear la unidad curricular",
      message: error.message
    });
  }
}
const actualizarUnidadCurricular = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const unidad = await UnidadCurricular.findByPk(id);
    if (!unidad) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe unidad curricular con id: ${id}`
      });
    }

    const { nombre, tipo, curso, division, periodoLectivo, activo } = req.body;
    const camposActualizar = {};
    if (nombre !== undefined) camposActualizar.nombre = nombre;
    if (tipo !== undefined) camposActualizar.tipo = tipo;
    if (curso !== undefined) camposActualizar.curso = curso;
    if (division !== undefined) camposActualizar.division = division;
    if (periodoLectivo !== undefined) camposActualizar.periodoLectivo = periodoLectivo;
    if (activo !== undefined) camposActualizar.activo = activo;

    await UnidadCurricular.update(camposActualizar, { where: { id } });
    const unidadActualizada = await UnidadCurricular.findByPk(id);

    res.status(200).json({
      status: 200,
      message: 'Unidad curricular actualizada exitosamente',
      data: unidadActualizada
    });
  } catch (error) {
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
      error: "Error al actualizar la unidad curricular",
      message: error.message
    });
  }
}

const eliminarUnidadCurricular = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const unidad = await UnidadCurricular.findByPk(id);
    if (!unidad) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe unidad curricular con id: ${id}`
      });
    }

    await UnidadCurricular.destroy({ where: { id } });
    res.status(200).json({
      status: 200,
      message: 'Unidad curricular eliminada exitosamente',
      data: unidad
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al eliminar la unidad curricular",
      message: error.message
    });
  }
}

const activarDesactivarUnCu = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const unidad = await UnidadCurricular.findByPk(id);
    if (!unidad) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe unidad curricular con id: ${id}`
      });
    }

    // Cambiar el estado activo
    const nuevoEstado = !unidad.activo;
    await UnidadCurricular.update({ activo: nuevoEstado }, { where: { id } });
    const unidadActualizada = await UnidadCurricular.findByPk(id);

    res.status(200).json({
      status: 200,
      message: `Unidad curricular ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`,
      data: unidadActualizada
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al cambiar el estado de la unidad curricular",
      message: error.message
    });
  }
}
export { listarUnidadesCurriculares, buscarUCporId, crearUnidadCurricular, actualizarUnidadCurricular, eliminarUnidadCurricular, activarDesactivarUnCu }