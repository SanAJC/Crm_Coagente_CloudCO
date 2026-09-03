import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  isCantidadValida,
  isCategoriaIdValido,
  isEstadoValido,
  isNombreValido,
  isPrecioValido,
  isSkuValido,
} from './product-validators.js';

@Injectable()
export class UpdateProductPipe implements PipeTransform {
  transform(value: any) {
    if (value?.sku !== undefined && !isSkuValido(value.sku)) {
      throw new BadRequestException('El sku no puede estar vacío');
    }

    if (value?.nombre !== undefined && !isNombreValido(value.nombre)) {
      throw new BadRequestException('El nombre no puede estar vacío');
    }

    if (value?.precio !== undefined && !isPrecioValido(value.precio)) {
      throw new BadRequestException('El precio debe ser un número mayor o igual a 0');
    }

    if (value?.categoriaId !== undefined && !isCategoriaIdValido(value.categoriaId)) {
      throw new BadRequestException('categoriaId debe ser un número entero positivo');
    }

    if (value?.costo !== undefined && !isPrecioValido(value.costo)) {
      throw new BadRequestException('El costo debe ser un número mayor o igual a 0');
    }

    if (value?.stockActual !== undefined && !isCantidadValida(value.stockActual)) {
      throw new BadRequestException('stockActual debe ser un número entero mayor o igual a 0');
    }

    if (value?.stockMinimo !== undefined && !isCantidadValida(value.stockMinimo)) {
      throw new BadRequestException('stockMinimo debe ser un número entero mayor o igual a 0');
    }

    if (value?.estado !== undefined && !isEstadoValido(value.estado)) {
      throw new BadRequestException('estado debe ser activo, inactivo o descontinuado');
    }

    return value;
  }
}
