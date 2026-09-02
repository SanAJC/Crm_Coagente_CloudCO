import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  isEmailValido,
  isEstadoValido,
  isNombreValido,
  isPasswordValida,
  isRoleIdValido,
} from './usuario-validators.js';

@Injectable()
export class UpdateUsuarioPipe implements PipeTransform {
  transform(value: any) {
    if (value?.nombre !== undefined && !isNombreValido(value.nombre)) {
      throw new BadRequestException('El nombre no puede estar vacío');
    }

    if (value?.email !== undefined && !isEmailValido(value.email)) {
      throw new BadRequestException('Formato de email inválido');
    }

    if (value?.password !== undefined && !isPasswordValida(value.password)) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    if (value?.roleId !== undefined && !isRoleIdValido(value.roleId)) {
      throw new BadRequestException('roleId debe ser un número entero positivo');
    }

    if (value?.estado !== undefined && !isEstadoValido(value.estado)) {
      throw new BadRequestException('estado debe ser activo, inactivo o suspendido');
    }

    return value;
  }
}
