import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  isEmailValido,
  isNombreValido,
  isPasswordValida,
  isRoleIdValido,
} from './usuario-validators.js';

@Injectable()
export class CreateUsuarioPipe implements PipeTransform {
  transform(value: any) {
    if (!isNombreValido(value?.nombre)) {
      throw new BadRequestException('El nombre es requerido');
    }

    if (!isEmailValido(value?.email)) {
      throw new BadRequestException('Formato de email inválido');
    }

    if (!isPasswordValida(value?.password)) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    if (!isRoleIdValido(value?.roleId)) {
      throw new BadRequestException('roleId debe ser un número entero positivo');
    }

    return value;
  }
}
