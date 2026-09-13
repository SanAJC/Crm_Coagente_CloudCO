import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isCantidadValida } from './order-item-validators.js';

@Injectable()
export class UpdateOrderItemPipe implements PipeTransform {
  transform(value: any) {
    if (!isCantidadValida(value?.cantidad)) {
      throw new BadRequestException('cantidad debe ser un número entero mayor o igual a 1');
    }

    return value;
  }
}
