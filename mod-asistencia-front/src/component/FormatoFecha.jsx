import { servicioFormatoDate } from "../servicios/servicioFormatoDate";

export const FormatoFecha = ({ fechaISO }) => {
  const fechaLegible = servicioFormatoDate(fechaISO);
  return <p>{fechaLegible}</p>;
};
