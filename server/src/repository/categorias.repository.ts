import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

export interface CrearCategoriaData {
  nombre: string;
  descripcion?: string;
}

export interface ActualizarCategoriaData {
  nombre?: string;
  descripcion?: string;
}

@Injectable()
export class CategoriasRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoria.findMany({ orderBy: { id: 'asc' } });
  }

  findById(id: number) {
    return this.prisma.categoria.findUnique({ where: { id } });
  }

  findByNombre(nombre: string) {
    return this.prisma.categoria.findUnique({ where: { nombre } });
  }

  create(data: CrearCategoriaData) {
    return this.prisma.categoria.create({ data });
  }

  update(id: number, data: ActualizarCategoriaData) {
    return this.prisma.categoria.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.categoria.delete({ where: { id } });
  }
}
