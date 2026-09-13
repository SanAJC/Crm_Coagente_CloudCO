import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MesasRepository } from '../../../repository/mesas.repository.js';
import type { CreateMesaDto } from './dto/create-mesa.dto.js';
import type { UpdateMesaDto } from './dto/update-mesa.dto.js';

@Injectable()
export class MesasService {
  constructor(private readonly mesasRepository: MesasRepository) {}

  findAll(activa?: boolean) {
    return this.mesasRepository.findAll(activa);
  }

  async findOne(id: number) {
    const mesa = await this.mesasRepository.findById(id);
    if (!mesa) {
      throw new NotFoundException('Mesa no encontrada');
    }
    return mesa;
  }

  async create(dto: CreateMesaDto) {
    const existente = await this.mesasRepository.findByNombre(dto.nombre);
    if (existente) {
      throw new ConflictException('Ya existe una mesa con ese nombre');
    }
    return this.mesasRepository.create({ nombre: dto.nombre });
  }

  async update(id: number, dto: UpdateMesaDto) {
    await this.findOne(id);

    if (dto.nombre) {
      const existente = await this.mesasRepository.findByNombre(dto.nombre);
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe una mesa con ese nombre');
      }
    }

    return this.mesasRepository.update(id, dto);
  }

  async desactivar(id: number) {
    await this.findOne(id);
    return this.mesasRepository.desactivar(id);
  }
}
