import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  isCantidadValida,
  isCategoriaIdValido,
  isNombreValido,
  isPrecioValido,
  isSkuValido,
} from './product-validators.js';

@Injectable()
export class CreateProductPipe implements PipeTransform {
  transform(value: any) {
    if (!isSkuValido(value?.sku)) {
      throw new BadRequestException('El sku es requerido');
    }

    if (!isNombreValido(value?.nombre)) {
      throw new BadRequestException('El nombre es requerido');
    }

    if (!isPrecioValido(value?.precio)) {
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

    return value;
  }
}
