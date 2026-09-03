import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isFechaValida, isIdValido } from './booking-validators.js';

@Injectable()
export class CreateBookingPipe implements PipeTransform {
  transform(value: any) {
    if (!isIdValido(value?.clienteId)) {
      throw new BadRequestException('clienteId debe ser un número entero positivo');
    }

    if (value?.fechaInicio !== undefined && !isFechaValida(value.fechaInicio)) {
      throw new BadRequestException('fechaInicio debe ser una fecha válida');
    }

    if (value?.fechaFin !== undefined && !isFechaValida(value.fechaFin)) {
      throw new BadRequestException('fechaFin debe ser una fecha válida');
    }

    return value;
  }
}
