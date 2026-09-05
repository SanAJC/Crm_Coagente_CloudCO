import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { MensajesRepository } from '../../repository/mensajes.repository.js';
import { N8nOutboundModule } from '../../webhooks/n8n/n8n-outbound.module.js';
import { MessagesController } from './messages.controller.js';
import { MessagesGateway } from './messages.gateway.js';
import { MessagesService } from './messages.service.js';

@Module({
  imports: [AuthModule, N8nOutboundModule],
  controllers: [MessagesController],
  providers: [MessagesService, MensajesRepository, MessagesGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
