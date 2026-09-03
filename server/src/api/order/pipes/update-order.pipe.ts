import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  isEstadoValido,
  isIdValido,
  isTotalValido,
} from './order-validators.js';

@Injectable()
export class UpdateOrderPipe implements PipeTransform {
  transform(value: any) {
    if (value?.clienteId !== undefined && !isIdValido(value.clienteId)) {
      throw new BadRequestException('clienteId debe ser un número entero positivo');
    }

    if (value?.reservaId !== undefined && !isIdValido(value.reservaId)) {
      throw new BadRequestException('reservaId debe ser un número entero positivo');
    }

    if (value?.usuarioId !== undefined && !isIdValido(value.usuarioId)) {
      throw new BadRequestException('usuarioId debe ser un número entero positivo');
    }

    if (value?.total !== undefined && !isTotalValido(value.total)) {
      throw new BadRequestException('total debe ser un número mayor o igual a 0');
    }

    if (value?.estado !== undefined && !isEstadoValido(value.estado)) {
      throw new BadRequestException(
        'estado debe ser pendiente, en_proceso, enviado, entregado o cancelado',
      );
    }

    return value;
  }
}
