import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * Módulo global: una sola instancia de PrismaService (una sola pool de
 * conexión) compartida por todos los módulos, sin volver a declararla
 * como provider en cada uno.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
