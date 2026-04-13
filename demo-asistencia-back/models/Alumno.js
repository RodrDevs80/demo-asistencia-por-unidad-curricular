import sequelize from "../config/database/conexion.js";
import { DataTypes } from "sequelize";

const Alumno = sequelize.define("Alumno", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
    allowNull: false,
  },
  dni: {
    type: DataTypes.STRING(8),
    unique: true,
    allowNull: false,
    validate: {
      is: {
        args: /^\d{8}$/,
        msg: "El DNI debe contener exactamente 8 dígitos numéricos"
      }
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: "Debe ingresar un email valido!"
    },
    set(value) {
      this.setDataValue("email", value ? value.trim() : null)
    }
  },
  celular: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
    validate: {
      is: {
        args: /^\d{7,15}$/,
        msg: "Ingrese un numero de celular valido"
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: "alumnos",
  timestamps: true,
  updatedAt: "fecha_actualizacion",
  createdAt: "fecha_creacion"
})

export default Alumno;