import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { RolesGuard } from './guards/roles.guard.js';
import { PermsGuard } from './guards/perm.decorator.js';

/**
 * Módulo global: exporta RolesGuard/PermsGuard para usar @UseGuards(RolesGuard) + @Roles(...)
 * o @UseGuards(PermsGuard) + @Perms(...) en cualquier controlador sin importar AuthModule
 * (evita dependencias circulares).
 */
@Global()
@Module({
  providers: [RolesGuard, PermsGuard, PrismaService],
  exports: [RolesGuard, PermsGuard],
})
export class RbacModule {}
