export function isSkuValido(sku: unknown): boolean {
  return typeof sku === 'string' && sku.trim().length > 0;
}

export function isNombreValido(nombre: unknown): boolean {
  return typeof nombre === 'string' && nombre.trim().length > 0;
}

export function isPrecioValido(precio: unknown): boolean {
  return typeof precio === 'number' && Number.isFinite(precio) && precio >= 0;
}

export function isCantidadValida(valor: unknown): boolean {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 0;
}

export function isCategoriaIdValido(categoriaId: unknown): boolean {
  return (
    typeof categoriaId === 'number' &&
    Number.isInteger(categoriaId) &&
    categoriaId > 0
  );
}

export function isEstadoValido(estado: unknown): boolean {
  return (
    typeof estado === 'string' &&
    ['activo', 'inactivo', 'descontinuado'].includes(estado)
  );
}
