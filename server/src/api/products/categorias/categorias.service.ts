import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriasRepository } from '../../../repository/categorias.repository.js';
import type { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import type { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Injectable()
export class CategoriasService {
  constructor(private readonly categoriasRepository: CategoriasRepository) {}

  findAll() {
    return this.categoriasRepository.findAll();
  }

  async findOne(id: number) {
    const categoria = await this.categoriasRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return categoria;
  }

  async create(dto: CreateCategoriaDto) {
    const existente = await this.categoriasRepository.findByNombre(dto.nombre);
    if (existente) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    return this.categoriasRepository.create(dto);
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    await this.findOne(id);

    if (dto.nombre) {
      const existente = await this.categoriasRepository.findByNombre(dto.nombre);
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }

    return this.categoriasRepository.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.categoriasRepository.delete(id);
    return { message: 'Categoría eliminada' };
  }
}
