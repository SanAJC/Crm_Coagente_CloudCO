export function isIdValido(valor: unknown): boolean {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

export function isCantidadValida(valor: unknown): boolean {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 1;
}
