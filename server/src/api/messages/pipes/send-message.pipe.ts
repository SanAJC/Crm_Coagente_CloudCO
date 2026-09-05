import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isTipoContenidoValido } from './message-validators.js';

@Injectable()
export class SendMessagePipe implements PipeTransform {
  transform(value: any) {
    if (value?.tipoContenido !== undefined && !isTipoContenidoValido(value.tipoContenido)) {
      throw new BadRequestException(
        'tipoContenido debe ser texto, imagen, audio, video, documento o ubicacion',
      );
    }

    if (!value?.contenido && !value?.urlAdjunto) {
      throw new BadRequestException('El mensaje necesita contenido o urlAdjunto');
    }

    return value;
  }
}
