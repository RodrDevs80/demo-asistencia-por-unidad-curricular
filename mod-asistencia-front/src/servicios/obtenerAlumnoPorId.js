import axios from "axios";

export const obtenerAlumnoPorId = async (id) => {
    try {
        const data = await axios.get(`http://localhost:3000/api/v1/alumnos/${id}`);
        return data.data.data;
    } catch (error) {
        console.log(error.message);
    }
}