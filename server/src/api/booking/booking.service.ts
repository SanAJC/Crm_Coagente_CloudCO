import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    const fechaInicio = dto.fechaInicio ? new Date(dto.fechaInicio) : undefined;
    const fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : undefined;

    if (dto.mesaId !== undefined) {
      await this.validarMesa(dto.mesaId);
      if (fechaInicio && fechaFin) {
        await this.validarDisponibilidad(dto.mesaId, fechaInicio, fechaFin);
      }
    }

    return this.reservasRepository.create({
      clienteId: dto.clienteId,
      usuarioId,
      fechaInicio,
      fechaFin,
      personas: dto.personas,
      mesaId: dto.mesaId,
      notas: dto.notas,
    });
  }

  async update(id: number, dto: UpdateBookingDto) {
    const actual = await this.findOne(id);

    if (dto.clienteId !== undefined) {
      await this.validarCliente(dto.clienteId);
    }

    if (dto.usuarioId !== undefined) {
      await this.validarUsuario(dto.usuarioId);
    }

    if (dto.mesaId !== undefined) {
      await this.validarMesa(dto.mesaId);
    }

    // Choque de horario: se valida contra el estado resultante (dto puede
    // tocar solo uno de mesa/fechas/estado a la vez). Una reserva que se está
    // marcando como cancelada/completada nunca choca consigo misma.
    const estadoResultante = dto.estado ?? actual.estado;
    const mesaResultante = dto.mesaId !== undefined ? dto.mesaId : actual.mesaId;
    const fechaInicioResultante = dto.fechaInicio ? new Date(dto.fechaInicio) : actual.fechaInicio;
    const fechaFinResultante = dto.fechaFin ? new Date(dto.fechaFin) : actual.fechaFin;

    if (
      mesaResultante &&
      fechaInicioResultante &&
      fechaFinResultante &&
      ['pendiente', 'confirmada'].includes(estadoResultante)
    ) {
      await this.validarDisponibilidad(
        mesaResultante,
        fechaInicioResultante,
        fechaFinResultante,
        id,
      );
    }

    return this.reservasRepository.update(id, {
      clienteId: dto.clienteId,
      usuarioId: dto.usuarioId,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      personas: dto.personas,
      mesaId: dto.mesaId,
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

  private async validarMesa(mesaId: number) {
    const mesa = await this.reservasRepository.findMesaById(mesaId);
    if (!mesa) {
      throw new BadRequestException('La mesa indicada no existe');
    }
  }

  private async validarDisponibilidad(
    mesaId: number,
    fechaInicio: Date,
    fechaFin: Date,
    excluirId?: number,
  ) {
    const choque = await this.reservasRepository.existeChoqueMesa(
      mesaId,
      fechaInicio,
      fechaFin,
      excluirId,
    );
    if (choque) {
      throw new ConflictException('La mesa ya tiene una reserva activa en ese horario');
    }
  }
}
