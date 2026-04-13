import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import { sequelize } from "./models/index.js"
import asistenciaRouter from "./routers/asistencia.routes.js"
import alumnoRouter from "./routers/alumno.routes.js"
import unidadCurricularRouter from "./routers/unidadCurricular.routes.js"
import inscripcionRouter from "./routers/inscripcion.routes.js"


dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const RAIZ = "/api/v1";

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(RAIZ, asistenciaRouter);
app.use(RAIZ, alumnoRouter);
app.use(RAIZ, unidadCurricularRouter);
app.use(RAIZ, inscripcionRouter);
app.get("/health", (req, res) => {
    res.json({
        status: 200,
        msg: "App funcionando 🧑‍💻",
        url: `http://localhost:${PORT}`
    })
})

const main = async () => {
    try {
        await sequelize.authenticate();
        // Sincroniza los modelos con la base de datos.
        // force: false (default) - No borra tablas si existen.
        // force: true - Borra y recrea tablas. ¡PELIGROSO en producción!
        // alter: true - Intenta modificar tablas existentes.
        await sequelize.sync({ force: false }); // Cambia bajo tu propio riesgo
        console.log("🔄 Modelos sincronizados con la base de datos.");
        app.listen(PORT, () => {
            console.log(`app de asistencia corriendo en http://localhost:${PORT}`)
        })
        console.log('conexion a la base de datos exitosa!');
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

main();




