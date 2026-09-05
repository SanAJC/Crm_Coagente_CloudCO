import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MensajesRepository } from '../../repository/mensajes.repository.js';
import { N8nOutboundService } from '../../webhooks/n8n/n8n-outbound.service.js';
import { MessagesGateway } from './messages.gateway.js';
import type { MensajeEntranteDto } from './dto/mensaje-entrante.dto.js';
import type { SendMessageDto } from './dto/send-message.dto.js';
import type { UpdateConversationDto } from './dto/update-conversation.dto.js';

@Injectable()
export class MessagesService {
  constructor(
    private readonly mensajesRepository: MensajesRepository,
    private readonly gateway: MessagesGateway,
    private readonly n8nOutboundService: N8nOutboundService,
  ) {}

  findAllConversaciones(estado?: string) {
    return this.mensajesRepository.findAllConversaciones(estado);
  }

  async findConversacion(id: number) {
    const conversacion = await this.mensajesRepository.findConversacionById(id);
    if (!conversacion) {
      throw new NotFoundException('Conversación no encontrada');
    }
    return conversacion;
  }

  async findMensajes(conversacionId: number) {
    await this.findConversacion(conversacionId);
    return this.mensajesRepository.findMensajesByConversacion(conversacionId);
  }

  async updateConversacion(id: number, dto: UpdateConversationDto) {
    await this.findConversacion(id);

    if (dto.clienteId !== undefined) {
      const cliente = await this.mensajesRepository.findClienteById(dto.clienteId);
      if (!cliente) {
        throw new BadRequestException('El cliente indicado no existe');
      }
    }

    const conversacion = await this.mensajesRepository.actualizarConversacion(id, dto);
    this.gateway.emitirConversacionActualizada(conversacion);
    return conversacion;
  }

  async enviarMensaje(conversacionId: number, dto: SendMessageDto, usuarioId: number) {
    const conversacion = await this.findConversacion(conversacionId);

    const mensaje = await this.mensajesRepository.crearMensajeSaliente(conversacionId, {
      tipoContenido: dto.tipoContenido,
      contenido: dto.contenido,
      urlAdjunto: dto.urlAdjunto,
      enviadoPorUsuarioId: usuarioId,
    });

    this.gateway.emitirMensajeNuevo(conversacionId, mensaje);

    const entregado = await this.n8nOutboundService.enviarAPlataforma({
      canal: conversacion.canal,
      canalChatId: conversacion.canalChatId,
      tipoContenido: mensaje.tipoContenido,
      contenido: mensaje.contenido,
      urlAdjunto: mensaje.urlAdjunto,
      mensajeId: mensaje.id,
    });

    return { ...mensaje, entregado };
  }

  async registrarMensajeEntrante(dto: MensajeEntranteDto) {
    const resultado = await this.mensajesRepository.crearMensajeEntrante({
      canal: dto.canal,
      canalChatId: dto.canalChatId,
      clienteId: dto.clienteId,
      canalMensajeId: dto.canalMensajeId,
      remitente: dto.remitente,
      tipoContenido: dto.tipoContenido,
      contenido: dto.contenido,
      urlAdjunto: dto.urlAdjunto,
      metadata: dto.metadata,
    });

    if (!resultado.duplicado) {
      this.gateway.emitirMensajeNuevo(resultado.conversacion.id, resultado.mensaje);
      this.gateway.emitirConversacionActualizada(resultado.conversacion);
    }

    return resultado;
  }
}
