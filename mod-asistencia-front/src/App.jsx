import { useEffect, useState } from "react";
import axios from "axios";
import { obtenerAlumnoPorId } from "./servicios/obtenerAlumnoPorId";
import { FormatoFecha } from "./component/FormatoFecha";
import { verificarAsistenciaHoy } from "./servicios/verificarAsistenciaHoy";

function App() {
  const [listadoUC, setListadoUC] = useState([]);
  const [idUc, setIdUc] = useState(null);
  const [listadoAlumnos, setListadoAlumnos] = useState([]);
  const [datosAlumno, setDatosAlumno] = useState({});
  const [datosUC, setDatosUc] = useState({});
  const [datosAsistencia, seteDatosAsistencia] = useState([]);
  const [porcentaje, setPorcentaje] = useState(0);
  const [registroAsist, setRegistroAsist] = useState([]);
  const [errorAsistencia, setErrorAsistencia] = useState("");

  // Estados para modales
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [isTomarAsistenciaModalOpen, setIsTomarAsistenciaModalOpen] =
    useState(false);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modo oscuro
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  const manejarUc = async (v) => {
    const nuevoIdUc = v.value;

    if (nuevoIdUc === "") {
      setIdUc(null);
      setListadoAlumnos([]);
      return;
    }

    setIdUc(nuevoIdUc);

    try {
      const resInscripciones = await axios.get(
        "http://localhost:3000/api/v1/inscripciones"
      );
      const inscripcionesPorAlumno = resInscripciones.data.data.filter(
        (i) => i.idUnidadCurricular == nuevoIdUc
      );

      const promesasAlumnos = inscripcionesPorAlumno.map((insc) =>
        obtenerAlumnoPorId(insc.idAlumno)
      );
      const alumnosResueltos = await Promise.all(promesasAlumnos);

      setListadoAlumnos(alumnosResueltos);
    } catch (error) {
      console.error(error.message);
    }
  };

  const manejarDetalle = async (idAlumno, idUnidadCurricular) => {
    try {
      const data = await axios.get(
        `http://localhost:3000/api/v1/asistencias/alumno-uc/${idAlumno}/${Number(
          idUnidadCurricular
        )}`
      );

      const nuevaDataAlumno = data.data.data.datosAlumno;
      const nuevaDataUC = data.data.data.datosUC;
      const nuevaListaDataAsistencia = data.data.data.asistenciasPorRegistro;
      const nuevoPorcentaje = data.data.data.porcentaje;

      setDatosAlumno(nuevaDataAlumno);
      setDatosUc(nuevaDataUC);
      seteDatosAsistencia(nuevaListaDataAsistencia);
      setPorcentaje(nuevoPorcentaje);
      setIsDetalleModalOpen(true);
    } catch (error) {
      console.error(error.message);
    }
  };

  const manejarTomarAsistencia = async (idUnidad) => {
    setIsLoading(true);
    try {
      const resInscripciones = await axios.get(
        "http://localhost:3000/api/v1/inscripciones"
      );
      const inscripcionesPorAlumno = resInscripciones.data.data.filter(
        (i) => i.idUnidadCurricular == idUnidad
      );

      const promesasAlumnos = inscripcionesPorAlumno.map((insc) =>
        obtenerAlumnoPorId(insc.idAlumno)
      );

      const alumnosResueltos = await Promise.all(promesasAlumnos);

      let dettallesData = [];
      dettallesData.push(idUnidad);
      dettallesData.push(inscripcionesPorAlumno);
      dettallesData.push(alumnosResueltos);

      setRegistroAsist(dettallesData);
      setCurrentStudentIndex(0);
      setIsTomarAsistenciaModalOpen(true);
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const manejarPresencia = async (idA, idunCu, registro, enClase) => {
    setErrorAsistencia("");

    try {
      // 1. Verificar si ya registró asistencia hoy
      const yaRegistroHoy = await verificarAsistenciaHoy(idA, idunCu);

      if (yaRegistroHoy) {
        setErrorAsistencia(
          "Este alumno ya registró asistencia hoy para esta unidad curricular."
        );
        // No avanzamos al siguiente alumno
        return;
      }

      // 2. Buscar el id de inscripción
      const registroFiltrado = registro.filter(
        (reg) => reg.idAlumno == idA && reg.idUnidadCurricular == idunCu
      );

      const idDeLRegistro = registroFiltrado[0]?.id;
      if (!idDeLRegistro) {
        setErrorAsistencia("No se encontró inscripción para el alumno");
        return;
      }

      // 3. Crear la asistencia
      const nuevaAsistencia = {
        idInscripcion: idDeLRegistro,
        estadoDelAlumno: enClase,
      };

      await axios.post(
        "http://localhost:3000/api/v1/asistencias",
        nuevaAsistencia
      );

      // 4. Avanzar al siguiente alumno
      const totalAlumnos = registroAsist[2]?.length || 0;
      if (currentStudentIndex + 1 < totalAlumnos) {
        setCurrentStudentIndex(currentStudentIndex + 1);
        setErrorAsistencia(""); // Limpiar error al avanzar
      } else {
        setIsTomarAsistenciaModalOpen(false);
        setRegistroAsist([]);
        setCurrentStudentIndex(0);
        alert("Asistencia registrada para todos los alumnos");
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setErrorAsistencia("Error al registrar asistencia. Intente nuevamente.");
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/v1/unidades-curriculares")
      .then((res) => {
        setListadoUC(res.data.data);
      })
      .catch((e) => console.log(e.message));
  }, []);

  // Alumno actual para el modal de tomar asistencia
  const currentStudent = registroAsist[2]?.[currentStudentIndex];
  const totalStudents = registroAsist[2]?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Botón de modo oscuro */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:scale-110 transition-transform duration-200"
        aria-label="Cambiar modo oscuro"
      >
        {darkMode ? (
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white animate-fade-in">
          Sistema de Asistencia por Unidad Curricular
        </h1>

        {/* Listado de Unidades Curriculares */}
        <section className="mb-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-all hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Unidades Curriculares
          </h2>
          <div className="space-y-3">
            {listadoUC.map((uc) => (
              <div
                key={uc.id}
                className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800 dark:text-white">
                    {uc.nombre}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {uc.curso}
                  </p>
                </div>
                <button
                  onClick={() => manejarTomarAsistencia(uc.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Cargando..." : "Tomar asistencia"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Listado de Alumnos por UC */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Alumnos por Unidad Curricular
          </h2>
          <label
            htmlFor="uc"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Elige una Unidad Curricular:
          </label>
          <select
            id="uc"
            className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => manejarUc(e.target)}
          >
            <option value="">-- Seleccione una UC --</option>
            {listadoUC.map((uc) => (
              <option key={uc.id} value={uc.id}>
                {uc.nombre}
              </option>
            ))}
          </select>

          {idUc == null ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No hay ninguna Unidad Curricular seleccionada
            </p>
          ) : (
            <div className="space-y-3">
              {listadoAlumnos.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-white">
                      {a.apellido}, {a.nombre}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      DNI: {a.dni}
                    </p>
                  </div>
                  <button
                    onClick={() => manejarDetalle(a.id, idUc)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Ver asistencia
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal Detalle de Asistencia */}
      {isDetalleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Detalle de Asistencia
              </h2>
              <button
                onClick={() => setIsDetalleModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Unidad Curricular
                </h3>
                <p className="text-gray-800 dark:text-white">
                  {datosUC.nombreUC} - {datosUC.curso}
                </p>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Alumno
                </h3>
                <p className="text-gray-800 dark:text-white">
                  {datosAlumno.nombreAlumno} {datosAlumno.apellido} - DNI:{" "}
                  {datosAlumno.dni}
                </p>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Porcentaje de asistencia
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {porcentaje}%
                </p>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Registro de clases
                </h3>
                <div className="space-y-2">
                  {datosAsistencia.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-wrap gap-2 justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Clase N° {a.numeroDeClase}
                      </span>
                      <FormatoFecha fechaISO={a.fechaDeClase} />
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          a.estadoDelAlumno === "presente"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {a.estadoDelAlumno}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tomar Asistencia (un alumno a la vez) */}
      {isTomarAsistenciaModalOpen && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Tomar Asistencia
                </h2>
                <button
                  onClick={() => {
                    setIsTomarAsistenciaModalOpen(false);
                    setRegistroAsist([]);
                    setCurrentStudentIndex(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold mb-3">
                  {currentStudentIndex + 1}/{totalStudents}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {currentStudent.nombre} {currentStudent.apellido}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  DNI: {currentStudent.dni}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Fecha: {new Date().toLocaleDateString("es-ES")}
                </p>
              </div>
              {errorAsistencia && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded-lg text-sm text-center animate-fade-in">
                  {errorAsistencia}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() =>
                    manejarPresencia(
                      currentStudent.id,
                      registroAsist[0],
                      registroAsist[1],
                      "presente"
                    )
                  }
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  Presente
                </button>
                <button
                  onClick={() =>
                    manejarPresencia(
                      currentStudent.id,
                      registroAsist[0],
                      registroAsist[1],
                      "ausente"
                    )
                  }
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  Ausente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
