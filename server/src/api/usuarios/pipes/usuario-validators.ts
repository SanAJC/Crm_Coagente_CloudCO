export function isNombreValido(nombre: unknown): boolean {
  return typeof nombre === 'string' && nombre.trim().length > 0;
}

export function isEmailValido(email: unknown): boolean {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPasswordValida(password: unknown): boolean {
  return typeof password === 'string' && password.length >= 8;
}

export function isRoleIdValido(roleId: unknown): boolean {
  return typeof roleId === 'number' && Number.isInteger(roleId) && roleId > 0;
}

export function isEstadoValido(estado: unknown): boolean {
  return (
    typeof estado === 'string' &&
    ['activo', 'inactivo', 'suspendido'].includes(estado)
  );
}
