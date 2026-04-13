import Alumno from "../models/Alumno.js";


const listarAlumnos = async (req, res) => {
  try {
    const alumnos = await Alumno.findAll({
      where: { activo: true },
    });
    res.status(200).json({
      status: 200,
      message: alumnos.length === 0 ? 'No hay alumnos en la base de datos' : 'Alumnos obtenidos exitosamente',
      data: alumnos,
      total: alumnos.length
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al obtener el listado de alumnos",
      message: error.message
    });
  }
}

const buscarAlumnoPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const alumno = await Alumno.findByPk(id);
    if (!alumno) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe el alumno con el id: ${id}`
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Alumno obtenido exitosamente',
      data: alumno
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al obtener el alumno",
      message: error.message
    });
  }
}

const crearAlumno = async (req, res) => {
  try {
    const { dni, nombre, apellido, email, celular } = req.body;

    if (!dni || !nombre || !apellido || !email || !celular) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'Los campos dni, nombre, apellido, email y celular son requeridos'
      });
    }

    const nuevoAlumno = await Alumno.create({ dni, nombre, apellido, email, celular });

    res.status(201).json({
      status: 201,
      message: 'Alumno creado exitosamente',
      data: nuevoAlumno
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
      error: "Error al intentar crear alumno",
      message: error.message
    });
  }
}

const actualizarAlumno = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const alumnoAActualizar = await Alumno.findByPk(id);
    if (!alumnoAActualizar) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: `No existe el alumno buscado con el id: ${id}`
      });
    }

    const { dni, nombre, apellido, email, celular } = req.body;

    // Construir objeto con los campos a actualizar (solo los que vienen en la request)
    const camposActualizar = {};
    if (dni !== undefined) camposActualizar.dni = dni;
    if (nombre !== undefined) camposActualizar.nombre = nombre;
    if (apellido !== undefined) camposActualizar.apellido = apellido;
    if (email !== undefined) camposActualizar.email = email;
    if (celular !== undefined) camposActualizar.celular = celular;

    await Alumno.update(camposActualizar, { where: { id } });
    const alumnoActualizado = await Alumno.findByPk(id);

    res.status(200).json({
      status: 200,
      message: 'Alumno actualizado exitosamente',
      data: alumnoActualizado
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
      error: "Error al actualizar alumno",
      message: error.message
    });
  }
}

const eliminarAlumno = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const alumnoAEliminar = await Alumno.findByPk(id);
    if (!alumnoAEliminar) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: 'No existe el alumno buscado'
      });
    }

    await Alumno.destroy({ where: { id } });

    res.status(200).json({
      status: 200,
      message: 'Alumno eliminado exitosamente',
      data: alumnoAEliminar
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al eliminar alumno",
      message: error.message
    });
  }
}

const cambiarEstadoDelAlumnoPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        status: 400,
        title: 'Bad Request',
        message: 'ID inválido. Debe ser un número entero positivo'
      });
    }

    const alumno = await Alumno.findByPk(id);
    if (!alumno) {
      return res.status(404).json({
        status: 404,
        title: 'Not Found',
        message: 'No existe el alumno buscado'
      });
    }

    const nuevoEstado = !alumno.activo;
    await Alumno.update({ activo: nuevoEstado }, { where: { id } });
    const alumnoActualizado = await Alumno.findByPk(id);

    res.status(200).json({
      status: 200,
      message: `Alumno ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
      data: alumnoActualizado
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "Error al cambiar el estado del alumno",
      message: error.message
    });
  }
}

export { listarAlumnos, cambiarEstadoDelAlumnoPorId, crearAlumno, eliminarAlumno, actualizarAlumno, buscarAlumnoPorId }