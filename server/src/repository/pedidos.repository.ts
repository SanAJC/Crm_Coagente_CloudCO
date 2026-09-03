import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const PEDIDO_SELECT = {
  id: true,
  clienteId: true,
  reservaId: true,
  usuarioId: true,
  fechaPedido: true,
  estado: true,
  total: true,
  direccionEnvio: true,
  createdAt: true,
  updatedAt: true,
  cliente: { select: { id: true, nombre: true } },
  usuario: { select: { id: true, nombre: true } },
} as const;

export interface CrearPedidoData {
  clienteId: number;
  reservaId?: number;
  usuarioId: number;
  total?: number;
  direccionEnvio?: string;
}

export interface ActualizarPedidoData {
  clienteId?: number;
  reservaId?: number;
  usuarioId?: number;
  total?: number;
  direccionEnvio?: string;
  estado?: string;
}

@Injectable()
export class PedidosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(estado?: string) {
    return this.prisma.pedido.findMany({
      where: estado ? { estado } : undefined,
      select: PEDIDO_SELECT,
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.pedido.findUnique({
      where: { id },
      select: PEDIDO_SELECT,
    });
  }

  findClienteById(clienteId: number) {
    return this.prisma.cliente.findUnique({ where: { id: clienteId } });
  }

  findReservaById(reservaId: number) {
    return this.prisma.reserva.findUnique({ where: { id: reservaId } });
  }

  findUsuarioById(usuarioId: number) {
    return this.prisma.usuario.findUnique({ where: { id: usuarioId } });
  }

  create(data: CrearPedidoData) {
    return this.prisma.pedido.create({ data, select: PEDIDO_SELECT });
  }

  update(id: number, data: ActualizarPedidoData) {
    return this.prisma.pedido.update({
      where: { id },
      data,
      select: PEDIDO_SELECT,
    });
  }

  actualizarEstado(id: number, estado: string) {
    return this.prisma.pedido.update({
      where: { id },
      data: { estado },
      select: PEDIDO_SELECT,
    });
  }
}
