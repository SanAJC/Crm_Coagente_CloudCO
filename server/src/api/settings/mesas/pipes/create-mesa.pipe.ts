import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CreateMesaPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value?.nombre !== 'string' || value.nombre.trim().length === 0) {
      throw new BadRequestException('nombre es requerido');
    }

    return value;
  }
}
