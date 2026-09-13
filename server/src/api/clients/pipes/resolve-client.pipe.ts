import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const CANALES = ['telegram', 'whatsapp', 'instagram'];

@Injectable()
export class ResolveClientPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value?.canal !== 'string' || !CANALES.includes(value.canal)) {
      throw new BadRequestException('canal debe ser telegram, whatsapp o instagram');
    }

    if (typeof value?.canalChatId !== 'string' || value.canalChatId.trim().length === 0) {
      throw new BadRequestException('canalChatId es requerido');
    }

    return value;
  }
}
