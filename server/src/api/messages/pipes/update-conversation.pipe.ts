import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isEstadoConversacionValido, isIdValido } from './message-validators.js';

@Injectable()
export class UpdateConversationPipe implements PipeTransform {
  transform(value: any) {
    if (value?.estado !== undefined && !isEstadoConversacionValido(value.estado)) {
      throw new BadRequestException('estado debe ser abierta, cerrada o archivada');
    }

    if (value?.clienteId !== undefined && !isIdValido(value.clienteId)) {
      throw new BadRequestException('clienteId debe ser un número entero positivo');
    }

    return value;
  }
}
