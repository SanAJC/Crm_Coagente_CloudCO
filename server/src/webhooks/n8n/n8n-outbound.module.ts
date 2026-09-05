import { Module } from '@nestjs/common';
import { N8nOutboundService } from './n8n-outbound.service.js';

/**
 * Modulo separado de N8nModule (que maneja las rutas ENTRANTES desde n8n)
 * para evitar un import circular: MessagesModule necesita llamar al webhook
 * de salida, y N8nModule ya importa MessagesModule para el flujo entrante.
 */
@Module({
  providers: [N8nOutboundService],
  exports: [N8nOutboundService],
})
export class N8nOutboundModule {}
