import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service.js';
import { PERMS_KEY } from '../decorators/perm.decorator.js';

@Injectable()
export class PermsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPerms?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: { role?: number; userId?: number } }).user;

    if (!user?.role) {
      throw new ForbiddenException(
        'No se encontró rol en el token; vuelve a iniciar sesión',
      );
    }

    const permisosDelRol = await this.prisma.rolePermiso.findMany({
      where: { roleId: user.role },
      include: { permiso: true },
    });

    const nombresPermisos = new Set(permisosDelRol.map((rp) => rp.permiso.nombre));
    const tieneTodosLosPermisos = requiredPerms.every((perm) =>
      nombresPermisos.has(perm),
    );

    if (!tieneTodosLosPermisos) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    return true;
  }
}
