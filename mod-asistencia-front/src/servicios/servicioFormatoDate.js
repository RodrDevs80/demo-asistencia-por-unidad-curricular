export const servicioFormatoDate = (isoString, options = {}, locale = 'es-ES') => {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Fecha inválida';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',   // 'long' → "marzo", también puedes usar 'short' o 'numeric'
    day: 'numeric'
  };

  const mergedOptions = { ...defaultOptions, ...options };
  return new Intl.DateTimeFormat(locale, mergedOptions).format(date);
};