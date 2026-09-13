import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  isEstadoValido,
  isFechaValida,
  isIdValido,
  isPersonasValido,
} from './booking-validators.js';

@Injectable()
export class UpdateBookingPipe implements PipeTransform {
  transform(value: any) {
    if (value?.clienteId !== undefined && !isIdValido(value.clienteId)) {
      throw new BadRequestException('clienteId debe ser un número entero positivo');
    }

    if (value?.usuarioId !== undefined && !isIdValido(value.usuarioId)) {
      throw new BadRequestException('usuarioId debe ser un número entero positivo');
    }

    if (value?.fechaInicio !== undefined && !isFechaValida(value.fechaInicio)) {
      throw new BadRequestException('fechaInicio debe ser una fecha válida');
    }

    if (value?.fechaFin !== undefined && !isFechaValida(value.fechaFin)) {
      throw new BadRequestException('fechaFin debe ser una fecha válida');
    }

    if (value?.estado !== undefined && !isEstadoValido(value.estado)) {
      throw new BadRequestException(
        'estado debe ser pendiente, confirmada, cancelada o completada',
      );
    }

    if (value?.personas !== undefined && !isPersonasValido(value.personas)) {
      throw new BadRequestException('personas debe ser un número entero positivo');
    }

    if (value?.mesaId !== undefined && !isIdValido(value.mesaId)) {
      throw new BadRequestException('mesaId debe ser un número entero positivo');
    }

    return value;
  }
}
