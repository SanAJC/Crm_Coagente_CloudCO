import { Global, Module } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard.js';
import { PermsGuard } from './guards/perm.decorator.js';
import { AdminGuard } from './guards/admin.guard.js';
import { AgentApiKeyGuard } from './guards/agent-api-key.guard.js';

/**
 * Módulo global: exporta RolesGuard/PermsGuard/AdminGuard/AgentApiKeyGuard
 * para usar @UseGuards(RolesGuard) + @Roles(...), @UseGuards(PermsGuard) + @Perms(...),
 * @UseGuards(AdminGuard) o @UseGuards(AgentApiKeyGuard) en cualquier controlador
 * sin importar AuthModule (evita dependencias circulares).
 */
@Global()
@Module({
  providers: [RolesGuard, PermsGuard, AdminGuard, AgentApiKeyGuard],
  exports: [RolesGuard, PermsGuard, AdminGuard, AgentApiKeyGuard],
})
export class RbacModule {}
