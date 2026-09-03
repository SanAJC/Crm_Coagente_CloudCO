export function isNombreValido(nombre: unknown): boolean {
  return typeof nombre === 'string' && nombre.trim().length > 0;
}
