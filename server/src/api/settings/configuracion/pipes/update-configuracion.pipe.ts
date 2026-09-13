import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

@Injectable()
export class UpdateConfiguracionPipe implements PipeTransform {
  transform(value: any) {
    if (value?.horaApertura !== undefined && !HORA_REGEX.test(value.horaApertura)) {
      throw new BadRequestException('horaApertura debe tener formato HH:mm');
    }

    if (value?.horaCierre !== undefined && !HORA_REGEX.test(value.horaCierre)) {
      throw new BadRequestException('horaCierre debe tener formato HH:mm');
    }

    if (
      value?.intervaloMinutos !== undefined &&
      (typeof value.intervaloMinutos !== 'number' || value.intervaloMinutos < 5)
    ) {
      throw new BadRequestException('intervaloMinutos debe ser un número mayor o igual a 5');
    }

    if (
      value?.bufferMinutos !== undefined &&
      (typeof value.bufferMinutos !== 'number' || value.bufferMinutos < 0)
    ) {
      throw new BadRequestException('bufferMinutos debe ser un número mayor o igual a 0');
    }

    if (
      value?.tamanoMaximoGrupo !== undefined &&
      (typeof value.tamanoMaximoGrupo !== 'number' || value.tamanoMaximoGrupo < 1)
    ) {
      throw new BadRequestException('tamanoMaximoGrupo debe ser un número mayor o igual a 1');
    }

    if (
      value?.diasCerrados !== undefined &&
      (!Array.isArray(value.diasCerrados) ||
        !value.diasCerrados.every((d: unknown) => typeof d === 'number' && d >= 0 && d <= 6))
    ) {
      throw new BadRequestException('diasCerrados debe ser una lista de números entre 0 y 6');
    }

    return value;
  }
}
