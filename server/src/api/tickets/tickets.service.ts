import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketsRepository } from '../../repository/tickets.repository.js';
import type { CreateTicketDto } from './dto/create-ticket.dto.js';
import type { UpdateTicketDto } from './dto/update-ticket.dto.js';

const ESTADOS_RESUELTOS = ['resuelto', 'cerrado'];

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}

  findAll(estado?: string) {
    return this.ticketsRepository.findAll(estado);
  }

  async findOne(id: number) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }
    return ticket;
  }

  async create(dto: CreateTicketDto, creadoPorId: number) {
    if (dto.pedidoId !== undefined) {
      await this.validarPedido(dto.pedidoId);
    }
    if (dto.asignadoA !== undefined) {
      await this.validarUsuario(dto.asignadoA);
    }

    return this.ticketsRepository.create({
      pedidoId: dto.pedidoId,
      tipo: dto.tipo,
      asunto: dto.asunto,
      descripcion: dto.descripcion,
      prioridad: dto.prioridad,
      asignadoA: dto.asignadoA,
      creadoPor: creadoPorId,
    });
  }

  async update(id: number, dto: UpdateTicketDto) {
    const ticketActual = await this.findOne(id);

    if (dto.pedidoId !== undefined) {
      await this.validarPedido(dto.pedidoId);
    }
    if (dto.asignadoA !== undefined) {
      await this.validarUsuario(dto.asignadoA);
    }

    const debeMarcarResolucion =
      dto.estado &&
      ESTADOS_RESUELTOS.includes(dto.estado) &&
      !ticketActual.fechaResolucion;

    return this.ticketsRepository.update(id, {
      pedidoId: dto.pedidoId,
      tipo: dto.tipo,
      asunto: dto.asunto,
      descripcion: dto.descripcion,
      prioridad: dto.prioridad,
      estado: dto.estado,
      asignadoA: dto.asignadoA,
      fechaResolucion: debeMarcarResolucion ? new Date() : undefined,
    });
  }

  async cerrar(id: number) {
    const ticket = await this.findOne(id);
    return this.ticketsRepository.update(id, {
      estado: 'cerrado',
      fechaResolucion: ticket.fechaResolucion ?? new Date(),
    });
  }

  private async validarPedido(pedidoId: number) {
    const pedido = await this.ticketsRepository.findPedidoById(pedidoId);
    if (!pedido) {
      throw new BadRequestException('El pedido indicado no existe');
    }
  }

  private async validarUsuario(usuarioId: number) {
    const usuario = await this.ticketsRepository.findUsuarioById(usuarioId);
    if (!usuario) {
      throw new BadRequestException('El usuario indicado no existe');
    }
  }
}
