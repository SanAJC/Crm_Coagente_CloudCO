const TIPOS_CONTENIDO = ['texto', 'imagen', 'audio', 'video', 'documento', 'ubicacion'];
const ESTADOS_CONVERSACION = ['abierta', 'cerrada', 'archivada'];

export function isTipoContenidoValido(valor: unknown): boolean {
  return typeof valor === 'string' && TIPOS_CONTENIDO.includes(valor);
}

export function isEstadoConversacionValido(valor: unknown): boolean {
  return typeof valor === 'string' && ESTADOS_CONVERSACION.includes(valor);
}

export function isIdValido(valor: unknown): boolean {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}
