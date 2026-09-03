import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const CANALES = ['telegram', 'whatsapp', 'instagram'];
const REMITENTES = ['cliente', 'agente', 'sistema'];
const TIPOS_CONTENIDO = ['texto', 'imagen', 'audio', 'video', 'documento', 'ubicacion'];

@Injectable()
export class MensajeEntrantePipe implements PipeTransform {
  transform(value: any) {
    if (typeof value?.canal !== 'string' || !CANALES.includes(value.canal)) {
      throw new BadRequestException('canal debe ser telegram, whatsapp o instagram');
    }

    if (typeof value?.canalChatId !== 'string' || value.canalChatId.trim().length === 0) {
      throw new BadRequestException('canalChatId es requerido');
    }

    if (typeof value?.remitente !== 'string' || !REMITENTES.includes(value.remitente)) {
      throw new BadRequestException('remitente debe ser cliente, agente o sistema');
    }

    if (
      value?.tipoContenido !== undefined &&
      !TIPOS_CONTENIDO.includes(value.tipoContenido)
    ) {
      throw new BadRequestException(
        'tipoContenido debe ser texto, imagen, audio, video, documento o ubicacion',
      );
    }

    return value;
  }
}
