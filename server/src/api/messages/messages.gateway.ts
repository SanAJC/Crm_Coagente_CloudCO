import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { parseCookie } from 'cookie';
import type { Server, Socket } from 'socket.io';
import { AuthService } from '../../auth/auth.service.js';
import { ACCESS_TOKEN_COOKIE } from '../../auth/auth.constants.js';

const SALA_INBOX = 'inbox';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const rawCookie = client.handshake.headers.cookie;
    const token = rawCookie ? parseCookie(rawCookie)[ACCESS_TOKEN_COOKIE] : undefined;

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
