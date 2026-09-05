import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { AuthService } from '../../auth/auth.service.js';

const SALA_INBOX = 'inbox';

/**
 * Empuja mensajes/conversaciones en tiempo real al frontend del CRM.
 * n8n habla con el backend por HTTP (webhooks); el navegador no puede
 * exponer un endpoint para que le llamen, asi que aca el unico canal
 * posible es WebSocket. Ver server/docs/plan-mensajes-webhooks.md.
 */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      client.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.authService.validateToken(token);
      client.data.user = payload;
      client.join(SALA_INBOX);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('conversacion:unirse')
  handleJoinConversacion(client: Socket, conversacionId: number) {
    client.join(`conversacion:${conversacionId}`);
  }

  @SubscribeMessage('conversacion:salir')
  handleLeaveConversacion(client: Socket, conversacionId: number) {
    client.leave(`conversacion:${conversacionId}`);
  }

  emitirMensajeNuevo(conversacionId: number, mensaje: unknown) {
    this.server
      .to(`conversacion:${conversacionId}`)
      .to(SALA_INBOX)
      .emit('mensaje:nuevo', { conversacionId, mensaje });
  }

  emitirConversacionActualizada(conversacion: unknown) {
    this.server.to(SALA_INBOX).emit('conversacion:actualizada', conversacion);
  }
}
