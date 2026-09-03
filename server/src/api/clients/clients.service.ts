import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ClientesRepository } from '../../repository/clientes.repository.js';
import { Prisma } from '../../generated/prisma/client.js';
import type { CreateClientDto } from './dto/create-client.dto.js';
import type { UpdateClientDto } from './dto/update-client.dto.js';

@Injectable()
export class ClientsService {
  constructor(private readonly clientesRepository: ClientesRepository) {}

  findAll(tipoCliente?: string) {
    return this.clientesRepository.findAll(tipoCliente);
  }

  async findOne(id: number) {
    const cliente = await this.clientesRepository.findById(id);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async create(dto: CreateClientDto) {
    if (dto.email) {
      await this.validarEmailDisponible(dto.email);
    }

    return this.clientesRepository.create(dto);
  }

  async update(id: number, dto: UpdateClientDto) {
    await this.findOne(id);

    if (dto.email) {
      await this.validarEmailDisponible(dto.email, id);
    }

    return this.clientesRepository.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.clientesRepository.delete(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'No se puede eliminar: el cliente tiene reservas o pedidos asociados',
        );
      }
      throw error;
    }

    return { message: 'Cliente eliminado' };
  }

  private async validarEmailDisponible(email: string, idActual?: number) {
    const existente = await this.clientesRepository.findByEmail(email);
    if (existente && existente.id !== idActual) {
      throw new ConflictException('Ya existe un cliente con ese email');
    }
  }
}
