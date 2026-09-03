import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PedidosRepository } from '../../repository/pedidos.repository.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import type { UpdateOrderDto } from './dto/update-order.dto.js';

@Injectable()
export class OrderService {
  constructor(private readonly pedidosRepository: PedidosRepository) {}

  findAll(estado?: string) {
    return this.pedidosRepository.findAll(estado);
  }

  async findOne(id: number) {
    const pedido = await this.pedidosRepository.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
  }

  async create(dto: CreateOrderDto, usuarioId: number) {
    await this.validarCliente(dto.clienteId);
    if (dto.reservaId !== undefined) {
      await this.validarReserva(dto.reservaId);
    }

    return this.pedidosRepository.create({
      clienteId: dto.clienteId,
      reservaId: dto.reservaId,
      usuarioId,
      total: dto.total,
      direccionEnvio: dto.direccionEnvio,
    });
  }

  async update(id: number, dto: UpdateOrderDto) {
    await this.findOne(id);

    if (dto.clienteId !== undefined) {
      await this.validarCliente(dto.clienteId);
    }
    if (dto.reservaId !== undefined) {
      await this.validarReserva(dto.reservaId);
    }
    if (dto.usuarioId !== undefined) {
      await this.validarUsuario(dto.usuarioId);
    }

    return this.pedidosRepository.update(id, dto);
  }

  async cancelar(id: number) {
    await this.findOne(id);
    return this.pedidosRepository.actualizarEstado(id, 'cancelado');
  }

  private async validarCliente(clienteId: number) {
    const cliente = await this.pedidosRepository.findClienteById(clienteId);
    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }
  }

  private async validarReserva(reservaId: number) {
    const reserva = await this.pedidosRepository.findReservaById(reservaId);
    if (!reserva) {
      throw new BadRequestException('La reserva indicada no existe');
    }
  }

  private async validarUsuario(usuarioId: number) {
    const usuario = await this.pedidosRepository.findUsuarioById(usuarioId);
    if (!usuario) {
      throw new BadRequestException('El usuario indicado no existe');
    }
  }
}
