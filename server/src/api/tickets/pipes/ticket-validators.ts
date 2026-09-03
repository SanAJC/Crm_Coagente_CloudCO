export function isAsuntoValido(asunto: unknown): boolean {
  return typeof asunto === 'string' && asunto.trim().length > 0;
}

export function isIdValido(valor: unknown): boolean {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

export function isTipoValido(tipo: unknown): boolean {
  return (
    typeof tipo === 'string' &&
    ['seguimiento', 'incidencia', 'consulta', 'devolucion'].includes(tipo)
  );
}

export function isPrioridadValida(prioridad: unknown): boolean {
  return (
    typeof prioridad === 'string' &&
    ['baja', 'media', 'alta', 'urgente'].includes(prioridad)
  );
}

export function isEstadoValido(estado: unknown): boolean {
  return (
    typeof estado === 'string' &&
    ['abierto', 'en_proceso', 'resuelto', 'cerrado'].includes(estado)
  );
}
