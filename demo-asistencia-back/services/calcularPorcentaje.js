
export const calcularPorcentaje = (cantidadPresentes, cantidadDeClases) => {
    const porcentaje = ((100 * cantidadPresentes) / cantidadDeClases).toFixed(0);
    return Number(porcentaje);
}