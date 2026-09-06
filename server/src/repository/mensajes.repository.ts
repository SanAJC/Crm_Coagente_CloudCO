import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const CONVERSACION_SELECT = {
  id: true,
  clienteId: true,
  canal: true,
  canalChatId: true,
  ticketId: true,
  estado: true,
  ultimoMensajeAt: true,
  createdAt: true,
  cliente: { select: { id: true, nombre: true, email: true, telefono: true } },
} as const;

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

export interface CrearMensajeSalienteData {
  tipoContenido?: string;
  contenido?: string;
  urlAdjunto?: string;
  enviadoPorUsuarioId: number;
}

export interface ActualizarConversacionData {
  estado?: string;
  clienteId?: number;
  ticketId?: number;
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

  findClienteById(clienteId: number) {
    return this.prisma.cliente.findUnique({ where: { id: clienteId } });
  }

  findAllConversaciones(estado?: string) {
    return this.prisma.conversacion.findMany({
      where: estado ? { estado } : undefined,
      select: CONVERSACION_SELECT,
      orderBy: { ultimoMensajeAt: 'desc' },
    });
  }

  findConversacionById(id: number) {
    return this.prisma.conversacion.findUnique({
      where: { id },
      select: CONVERSACION_SELECT,
    });
  }

  findMensajesByConversacion(conversacionId: number) {
    return this.prisma.mensaje.findMany({
      where: { conversacionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  actualizarConversacion(id: number, data: ActualizarConversacionData) {
    return this.prisma.conversacion.update({
      where: { id },
      data,
      select: CONVERSACION_SELECT,
    });
  }

  async crearMensajeSaliente(conversacionId: number, data: CrearMensajeSalienteData) {
    const [mensaje] = await this.prisma.$transaction([
      this.prisma.mensaje.create({
        data: {
          conversacionId,
          remitente: 'agente',
          tipoContenido: data.tipoContenido,
          contenido: data.contenido,
          urlAdjunto: data.urlAdjunto,
          enviadoPorUsuarioId: data.enviadoPorUsuarioId,
        },
      }),
      this.prisma.conversacion.update({
        where: { id: conversacionId },
        data: { ultimoMensajeAt: new Date() },
      }),
    ]);

    return mensaje;
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
