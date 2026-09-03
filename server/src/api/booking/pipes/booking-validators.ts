export function isIdValido(valor: unknown): boolean {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

export function isFechaValida(valor: unknown): boolean {
  return typeof valor === 'string' && !Number.isNaN(Date.parse(valor));
}

export function isEstadoValido(estado: unknown): boolean {
  return (
    typeof estado === 'string' &&
    ['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)
  );
}
