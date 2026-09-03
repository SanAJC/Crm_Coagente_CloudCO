import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isNombreValido } from './categoria-validators.js';

@Injectable()
export class UpdateCategoriaPipe implements PipeTransform {
  transform(value: any) {
    if (value?.nombre !== undefined && !isNombreValido(value.nombre)) {
      throw new BadRequestException('El nombre no puede estar vacío');
    }

    return value;
  }
}
