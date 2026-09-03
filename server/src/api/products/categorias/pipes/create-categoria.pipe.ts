import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isNombreValido } from './categoria-validators.js';

@Injectable()
export class CreateCategoriaPipe implements PipeTransform {
  transform(value: any) {
    if (!isNombreValido(value?.nombre)) {
      throw new BadRequestException('El nombre es requerido');
    }

    return value;
  }
}
