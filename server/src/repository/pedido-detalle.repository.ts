import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const ITEM_SELECT = {
  id: true,
  pedidoId: true,
  productoId: true,
  cantidad: true,
  precioUnitario: true,
  subtotal: true,
  producto: { select: { id: true, nombre: true, sku: true } },
} as const;

export interface CrearItemData {
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ActualizarItemData {
  cantidad: number;
  subtotal: number;
}

@Injectable()
export class PedidoDetalleRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPedido(pedidoId: number) {
    return this.prisma.pedidoDetalle.findMany({
      where: { pedidoId },
      select: ITEM_SELECT,
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.pedidoDetalle.findUnique({
      where: { id },
      select: ITEM_SELECT,
    });
  }

  findProductoById(productoId: number) {
    return this.prisma.producto.findUnique({ where: { id: productoId } });
  }

  create(data: CrearItemData) {
    return this.prisma.pedidoDetalle.create({ data, select: ITEM_SELECT });
  }

  update(id: number, data: ActualizarItemData) {
    return this.prisma.pedidoDetalle.update({
      where: { id },
      data,
      select: ITEM_SELECT,
    });
  }

  delete(id: number) {
    return this.prisma.pedidoDetalle.delete({ where: { id } });
  }
}
