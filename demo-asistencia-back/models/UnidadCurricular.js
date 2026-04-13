import sequelize from "../config/database/conexion.js";
import { DataTypes } from "sequelize";

const UnidadCurricular = sequelize.define("UnidadCurricular",
  {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    tipo: {
      type: DataTypes.ENUM,
      values: ['materia', "taller", "seminario"]
    },
    curso: {
      type: DataTypes.ENUM,
      values: ['1 año', "2 año", "3 año"]
    },
    division: {
      type: DataTypes.STRING,
      allowNull: true
    },
    periodoLectivo: {
      type: DataTypes.ENUM("anual", "cuatrimestral"),
      field: "periodo_lectivo"
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: "unidades_curriculares",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion"
  }
)

export default UnidadCurricular;