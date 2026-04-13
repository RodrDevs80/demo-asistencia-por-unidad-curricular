import sequelize from "../config/database/conexion.js";
import { DataTypes, Sequelize } from "sequelize";
// Importa el modelo Inscripcion (ajusta la ruta según tu proyecto)
import Inscripcion from "../models/Inscripcion.js"; // o la ruta correcta

const Asistencia = sequelize.define("Asistencia",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
    idInscripcion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_inscripcion",
      references: {
        model: "inscripcion",
        key: "id"
      }
    },
    estadoDelAlumno: {
      type: DataTypes.ENUM("presente", "ausente"),
      field: "estado_alumno"
    },
    fechaDeClase: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
      field: "fecha_de_clase"
    },
    numeroDeClase: {
      type: DataTypes.INTEGER,
      field: "numero_de_clase"
    }
  },
  {
    tableName: "asistencia_alumno_uc",
    timestamps: false,
    hooks: {
      beforeCreate: async (asistencia, options) => {
        // 1. Obtener la unidad curricular desde la inscripción
        const inscripcion = await Inscripcion.findByPk(asistencia.idInscripcion, {
          attributes: ['idUnidadCurricular'],
          transaction: options.transaction,
          raw: true
        });
        if (!inscripcion) throw new Error('Inscripción no encontrada');
        const ucId = inscripcion.idUnidadCurricular;

        // 2. Normalizar fecha
        const fechaSolo = new Date(asistencia.fechaDeClase);
        fechaSolo.setHours(0, 0, 0, 0);
        const fechaStr = fechaSolo.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        // 3. Buscar si ya existe asistencia para la misma UC y fecha (usando SQL directo)
        const [existe] = await sequelize.query(
          `SELECT numero_de_clase FROM asistencia_alumno_uc 
     WHERE id_inscripcion IN (SELECT id FROM inscripcion WHERE id_unidad_curricular = :ucId)
       AND DATE(fecha_de_clase) = :fecha
     LIMIT 1`,
          {
            replacements: { ucId, fecha: fechaStr },
            type: sequelize.QueryTypes.SELECT,
            transaction: options.transaction
          }
        );

        if (existe) {
          asistencia.numeroDeClase = existe.numero_de_clase;
          return;
        }

        // 4. Contar fechas distintas anteriores para esa UC
        const [countResult] = await sequelize.query(
          `SELECT COUNT(DISTINCT DATE(fecha_de_clase)) as count 
     FROM asistencia_alumno_uc 
     WHERE id_inscripcion IN (SELECT id FROM inscripcion WHERE id_unidad_curricular = :ucId)
       AND DATE(fecha_de_clase) < :fecha`,
          {
            replacements: { ucId, fecha: fechaStr },
            type: sequelize.QueryTypes.SELECT,
            transaction: options.transaction
          }
        );

        asistencia.numeroDeClase = (countResult?.count || 0) + 1;
      }
    },
  }
);

export default Asistencia;