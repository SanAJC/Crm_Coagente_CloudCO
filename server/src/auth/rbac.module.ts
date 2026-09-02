import { Global, Module } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard.js';
import { PermsGuard } from './guards/perm.decorator.js';
import { AdminGuard } from './guards/admin.guard.js';

/**
 * Módulo global: exporta RolesGuard/PermsGuard/AdminGuard para usar
 * @UseGuards(RolesGuard) + @Roles(...), @UseGuards(PermsGuard) + @Perms(...)
 * o @UseGuards(AdminGuard) en cualquier controlador sin importar AuthModule
 * (evita dependencias circulares).
 */
@Global()
@Module({
  providers: [RolesGuard, PermsGuard, AdminGuard],
  exports: [RolesGuard, PermsGuard, AdminGuard],
})
export class RbacModule {}
