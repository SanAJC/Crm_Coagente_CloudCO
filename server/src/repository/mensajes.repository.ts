import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

export interface CrearMensajeData {
  canal: string;
  canalChatId: string;
  clienteId?: number;
  canalMensajeId?: string;
  remitente: string;
  tipoContenido?: string;
  contenido?: string;
  urlAdjunto?: string;
  metadata?: object;
  enviadoPorUsuarioId?: number;
}

@Injectable()
export class MensajesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUsuarioById(usuarioId: number) {
    return this.prisma.usuario.findUnique({ where: { id: usuarioId } });
  }

  findUsuarioByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  private upsertConversacion(canal: string, canalChatId: string, clienteId?: number) {
    return this.prisma.conversacion.upsert({
      where: { canal_canalChatId: { canal, canalChatId } },
      update: clienteId !== undefined ? { clienteId } : {},
      create: { canal, canalChatId, clienteId, estado: 'abierta' },
    });
  }

  async crearMensajeEntrante(data: CrearMensajeData) {
    const conversacion = await this.upsertConversacion(
      data.canal,
      data.canalChatId,
      data.clienteId,
    );

    const mensajeExistente = data.canalMensajeId
      ? await this.prisma.mensaje.findFirst({
          where: { canalMensajeId: data.canalMensajeId },
        })
      : null;

    if (mensajeExistente) {
      return { conversacion, mensaje: mensajeExistente, duplicado: true };
    }

    const [mensaje] = await this.prisma.$transaction([
      this.prisma.mensaje.create({
        data: {
          conversacionId: conversacion.id,
          canalMensajeId: data.canalMensajeId,
          remitente: data.remitente,
          tipoContenido: data.tipoContenido,
          contenido: data.contenido,
          urlAdjunto: data.urlAdjunto,
          metadata: data.metadata,
          enviadoPorUsuarioId: data.enviadoPorUsuarioId,
        },
      }),
      this.prisma.conversacion.update({
        where: { id: conversacion.id },
        data: { ultimoMensajeAt: new Date() },
      }),
    ]);

    return { conversacion, mensaje, duplicado: false };
  }
}
