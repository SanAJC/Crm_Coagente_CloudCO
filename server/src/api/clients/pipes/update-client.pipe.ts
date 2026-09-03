import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  isEmailValido,
  isNombreValido,
  isTipoClienteValido,
} from './client-validators.js';

@Injectable()
export class UpdateClientPipe implements PipeTransform {
  transform(value: any) {
    if (value?.nombre !== undefined && !isNombreValido(value.nombre)) {
      throw new BadRequestException('El nombre no puede estar vacío');
    }

    if (value?.email !== undefined && !isEmailValido(value.email)) {
      throw new BadRequestException('Formato de email inválido');
    }

    if (value?.tipoCliente !== undefined && !isTipoClienteValido(value.tipoCliente)) {
      throw new BadRequestException('tipoCliente debe ser regular, vip o corporativo');
    }

    return value;
  }
}
