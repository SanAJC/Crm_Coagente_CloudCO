import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isCantidadValida, isIdValido } from './order-item-validators.js';

@Injectable()
export class CreateOrderItemPipe implements PipeTransform {
  transform(value: any) {
    if (!isIdValido(value?.productoId)) {
      throw new BadRequestException('productoId debe ser un número entero positivo');
    }

    if (!isCantidadValida(value?.cantidad)) {
      throw new BadRequestException('cantidad debe ser un número entero mayor o igual a 1');
    }

    return value;
  }
}
