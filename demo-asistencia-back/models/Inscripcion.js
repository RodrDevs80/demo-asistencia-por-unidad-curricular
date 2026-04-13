import sequelize from "../config/database/conexion.js";
import { DataTypes } from "sequelize";


//alumnoXUnidadCurricular
const Inscripcion = sequelize.define("Inscripcion",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true,
            allowNull: false,
        },
        idAlumno: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_alumno",
            references: {
                model: "alumnos",
                key: "id"
            },
            estadoInscripcion: {
                type: DataTypes.ENUM,

            }
        },
        idUnidadCurricular: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_unidad_curricular",
            references: {
                model: "unidades_curriculares",
                key: "id"
            }
        },
        anioCursado: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "anio_cursado",
            validate: {
                min: 2015,
                max: new Date().getFullYear() + 5
            }
        },
        estadoAlumnoUnidadC: {
            type: DataTypes.ENUM,
            defaultValue: "regular",
            values: ['regular', 'libre'],
            field: "estado_alumno_unidad_curricular"
        }
    },
    {
        tableName: "inscripcion",
        timestamps: true,
        createdAt: "fecha_creacion",
        updatedAt: "fecha_actualizacion"
    }
)


export default Inscripcion;


