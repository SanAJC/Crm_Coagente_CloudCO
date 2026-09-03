export function isIdValido(valor: unknown): boolean {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

export function isTotalValido(total: unknown): boolean {
  return typeof total === 'number' && Number.isFinite(total) && total >= 0;
}

export function isEstadoValido(estado: unknown): boolean {
  return (
    typeof estado === 'string' &&
    ['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado'].includes(estado)
  );
}
