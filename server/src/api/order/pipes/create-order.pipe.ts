import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isIdValido, isTotalValido } from './order-validators.js';

@Injectable()
export class CreateOrderPipe implements PipeTransform {
  transform(value: any) {
    if (!isIdValido(value?.clienteId)) {
      throw new BadRequestException('clienteId debe ser un número entero positivo');
    }

    if (value?.reservaId !== undefined && !isIdValido(value.reservaId)) {
      throw new BadRequestException('reservaId debe ser un número entero positivo');
    }

    if (value?.total !== undefined && !isTotalValido(value.total)) {
      throw new BadRequestException('total debe ser un número mayor o igual a 0');
    }

    return value;
  }
}
