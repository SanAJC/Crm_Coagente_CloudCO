import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const TICKET_SELECT = {
  id: true,
  pedidoId: true,
  tipo: true,
  asunto: true,
  descripcion: true,
  prioridad: true,
  estado: true,
  asignadoA: true,
  creadoPor: true,
  createdAt: true,
  updatedAt: true,
  fechaResolucion: true,
  asignado: { select: { id: true, nombre: true } },
  creador: { select: { id: true, nombre: true } },
} as const;

export interface CrearTicketData {
  pedidoId?: number;
  tipo?: string;
  asunto: string;
  descripcion?: string;
  prioridad?: string;
  asignadoA?: number;
  creadoPor: number;
}

export interface ActualizarTicketData {
  pedidoId?: number;
  tipo?: string;
  asunto?: string;
  descripcion?: string;
  prioridad?: string;
  estado?: string;
  asignadoA?: number;
  fechaResolucion?: Date;
}

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(estado?: string) {
    return this.prisma.ticket.findMany({
      where: estado ? { estado } : undefined,
      select: TICKET_SELECT,
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.ticket.findUnique({
      where: { id },
      select: TICKET_SELECT,
    });
  }

  findPedidoById(pedidoId: number) {
    return this.prisma.pedido.findUnique({ where: { id: pedidoId } });
  }

  findUsuarioById(usuarioId: number) {
    return this.prisma.usuario.findUnique({ where: { id: usuarioId } });
  }

  create(data: CrearTicketData) {
    return this.prisma.ticket.create({ data, select: TICKET_SELECT });
  }

  update(id: number, data: ActualizarTicketData) {
    return this.prisma.ticket.update({
      where: { id },
      data,
      select: TICKET_SELECT,
    });
  }
}
