export function isNombreValido(nombre: unknown): boolean {
  return typeof nombre === 'string' && nombre.trim().length > 0;
}

export function isEmailValido(email: unknown): boolean {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isTipoClienteValido(tipoCliente: unknown): boolean {
  return (
    typeof tipoCliente === 'string' &&
    ['regular', 'vip', 'corporativo'].includes(tipoCliente)
  );
}
