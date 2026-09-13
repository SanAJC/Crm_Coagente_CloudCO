import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PedidoDetalleRepository } from '../../../repository/pedido-detalle.repository.js';
import { PedidosRepository } from '../../../repository/pedidos.repository.js';
import type { CreateOrderItemDto } from './dto/create-order-item.dto.js';
import type { UpdateOrderItemDto } from './dto/update-order-item.dto.js';

@Injectable()
export class OrderItemsService {
  constructor(
    private readonly pedidoDetalleRepository: PedidoDetalleRepository,
    private readonly pedidosRepository: PedidosRepository,
  ) {}

  async findByPedido(pedidoId: number) {
    await this.validarPedido(pedidoId);
    return this.pedidoDetalleRepository.findByPedido(pedidoId);
  }

  async create(pedidoId: number, dto: CreateOrderItemDto) {
    await this.validarPedido(pedidoId);

    const producto = await this.pedidoDetalleRepository.findProductoById(dto.productoId);
    if (!producto) {
      throw new BadRequestException('El producto indicado no existe');
    }
    if (producto.estado !== 'activo') {
      throw new BadRequestException('El producto no está activo');
    }

    const precioUnitario = Number(producto.precio);
    const item = await this.pedidoDetalleRepository.create({
      pedidoId,
      productoId: dto.productoId,
      cantidad: dto.cantidad,
      precioUnitario,
      subtotal: precioUnitario * dto.cantidad,
    });

    await this.recalcularTotal(pedidoId);
    return item;
  }

  async update(pedidoId: number, itemId: number, dto: UpdateOrderItemDto) {
    const item = await this.findItemOrFail(pedidoId, itemId);

    const actualizado = await this.pedidoDetalleRepository.update(itemId, {
      cantidad: dto.cantidad,
      subtotal: Number(item.precioUnitario) * dto.cantidad,
    });

    await this.recalcularTotal(pedidoId);
    return actualizado;
  }

  async remove(pedidoId: number, itemId: number) {
    await this.findItemOrFail(pedidoId, itemId);
    await this.pedidoDetalleRepository.delete(itemId);
    await this.recalcularTotal(pedidoId);
    return { message: 'Ítem eliminado del pedido' };
  }

  private async findItemOrFail(pedidoId: number, itemId: number) {
    const item = await this.pedidoDetalleRepository.findById(itemId);
    if (!item || item.pedidoId !== pedidoId) {
      throw new NotFoundException('Ítem no encontrado en este pedido');
    }
    return item;
  }

  private async validarPedido(pedidoId: number) {
    const pedido = await this.pedidosRepository.findById(pedidoId);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
  }

  private async recalcularTotal(pedidoId: number) {
    const items = await this.pedidoDetalleRepository.findByPedido(pedidoId);
    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    await this.pedidosRepository.actualizarTotal(pedidoId, total);
  }
}
