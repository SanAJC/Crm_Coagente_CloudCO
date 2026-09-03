import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const RESERVA_SELECT = {
  id: true,
  clienteId: true,
  usuarioId: true,
  fechaReserva: true,
  fechaInicio: true,
  fechaFin: true,
  estado: true,
  notas: true,
  createdAt: true,
  updatedAt: true,
  cliente: { select: { id: true, nombre: true } },
  usuario: { select: { id: true, nombre: true } },
} as const;

export interface CrearReservaData {
  clienteId: number;
  usuarioId: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  notas?: string;
}

export interface ActualizarReservaData {
  clienteId?: number;
  usuarioId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  notas?: string;
  estado?: string;
}

@Injectable()
export class ReservasRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(estado?: string) {
    return this.prisma.reserva.findMany({
      where: estado ? { estado } : undefined,
      select: RESERVA_SELECT,
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.reserva.findUnique({
      where: { id },
      select: RESERVA_SELECT,
    });
  }

  findClienteById(clienteId: number) {
    return this.prisma.cliente.findUnique({ where: { id: clienteId } });
  }

  findUsuarioById(usuarioId: number) {
    return this.prisma.usuario.findUnique({ where: { id: usuarioId } });
  }

  create(data: CrearReservaData) {
    return this.prisma.reserva.create({ data, select: RESERVA_SELECT });
  }

  update(id: number, data: ActualizarReservaData) {
    return this.prisma.reserva.update({
      where: { id },
      data,
      select: RESERVA_SELECT,
    });
  }

  actualizarEstado(id: number, estado: string) {
    return this.prisma.reserva.update({
      where: { id },
      data: { estado },
      select: RESERVA_SELECT,
    });
  }
}
