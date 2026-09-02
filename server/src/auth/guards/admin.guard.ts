import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service.js';

/**
 * Exige que el rol del usuario tenga es_admin = true en la tabla roles.
 * A diferencia de RolesGuard (que compara contra ids fijos), esta
 * verificacion vive en la base de datos: el rol que administra usuarios
 * no depende de que id le haya tocado en la siembra.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: { role?: number } }).user;

    if (!user?.role) {
      throw new ForbiddenException(
        'No se encontró rol en el token; vuelve a iniciar sesión',
      );
    }

    const rol = await this.prisma.role.findUnique({
      where: { id: user.role },
      select: { esAdmin: true },
    });

    if (!rol?.esAdmin) {
      throw new ForbiddenException('Esta acción es exclusiva del rol administrador');
    }

    return true;
  }
}
