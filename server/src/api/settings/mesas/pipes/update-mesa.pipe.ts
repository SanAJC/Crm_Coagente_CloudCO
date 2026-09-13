import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UpdateMesaPipe implements PipeTransform {
  transform(value: any) {
    if (value?.nombre !== undefined && typeof value.nombre !== 'string') {
      throw new BadRequestException('nombre debe ser un texto');
    }

    if (value?.activa !== undefined && typeof value.activa !== 'boolean') {
      throw new BadRequestException('activa debe ser un booleano');
    }

    return value;
  }
}
