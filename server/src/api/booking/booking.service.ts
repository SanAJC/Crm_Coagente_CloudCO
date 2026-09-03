import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReservasRepository } from '../../repository/reservas.repository.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';
import type { UpdateBookingDto } from './dto/update-booking.dto.js';

@Injectable()
export class BookingService {
  constructor(private readonly reservasRepository: ReservasRepository) {}

  findAll(estado?: string) {
    return this.reservasRepository.findAll(estado);
  }

  async findOne(id: number) {
    const reserva = await this.reservasRepository.findById(id);
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }
    return reserva;
  }

  async create(dto: CreateBookingDto, usuarioId: number) {
    await this.validarCliente(dto.clienteId);

    return this.reservasRepository.create({
      clienteId: dto.clienteId,
      usuarioId,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      notas: dto.notas,
    });
  }

  async update(id: number, dto: UpdateBookingDto) {
    await this.findOne(id);

    if (dto.clienteId !== undefined) {
      await this.validarCliente(dto.clienteId);
    }

    if (dto.usuarioId !== undefined) {
      await this.validarUsuario(dto.usuarioId);
    }

    return this.reservasRepository.update(id, {
      clienteId: dto.clienteId,
      usuarioId: dto.usuarioId,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      notas: dto.notas,
      estado: dto.estado,
    });
  }

  async cancelar(id: number) {
    await this.findOne(id);
    return this.reservasRepository.actualizarEstado(id, 'cancelada');
  }

  private async validarCliente(clienteId: number) {
    const cliente = await this.reservasRepository.findClienteById(clienteId);
    if (!cliente) {
      throw new BadRequestException('El cliente indicado no existe');
    }
  }

  private async validarUsuario(usuarioId: number) {
    const usuario = await this.reservasRepository.findUsuarioById(usuarioId);
    if (!usuario) {
      throw new BadRequestException('El usuario indicado no existe');
    }
  }
}
