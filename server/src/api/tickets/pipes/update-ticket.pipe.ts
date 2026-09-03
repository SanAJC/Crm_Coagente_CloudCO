import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  isAsuntoValido,
  isEstadoValido,
  isIdValido,
  isPrioridadValida,
  isTipoValido,
} from './ticket-validators.js';

@Injectable()
export class UpdateTicketPipe implements PipeTransform {
  transform(value: any) {
    if (value?.asunto !== undefined && !isAsuntoValido(value.asunto)) {
      throw new BadRequestException('El asunto no puede estar vacío');
    }

    if (value?.pedidoId !== undefined && !isIdValido(value.pedidoId)) {
      throw new BadRequestException('pedidoId debe ser un número entero positivo');
    }

    if (value?.tipo !== undefined && !isTipoValido(value.tipo)) {
      throw new BadRequestException(
        'tipo debe ser seguimiento, incidencia, consulta o devolucion',
      );
    }

    if (value?.prioridad !== undefined && !isPrioridadValida(value.prioridad)) {
      throw new BadRequestException('prioridad debe ser baja, media, alta o urgente');
    }

    if (value?.estado !== undefined && !isEstadoValido(value.estado)) {
      throw new BadRequestException(
        'estado debe ser abierto, en_proceso, resuelto o cerrado',
      );
    }

    if (value?.asignadoA !== undefined && !isIdValido(value.asignadoA)) {
      throw new BadRequestException('asignadoA debe ser un número entero positivo');
    }

    return value;
  }
}
