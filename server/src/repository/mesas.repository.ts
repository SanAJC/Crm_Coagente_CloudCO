import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

export interface CrearMesaData {
  nombre: string;
}

export interface ActualizarMesaData {
  nombre?: string;
  activa?: boolean;
}

@Injectable()
export class MesasRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(activa?: boolean) {
    return this.prisma.mesa.findMany({
      where: activa !== undefined ? { activa } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.mesa.findUnique({ where: { id } });
  }

  findByNombre(nombre: string) {
    return this.prisma.mesa.findUnique({ where: { nombre } });
  }

  create(data: CrearMesaData) {
    return this.prisma.mesa.create({ data });
  }

  update(id: number, data: ActualizarMesaData) {
    return this.prisma.mesa.update({ where: { id }, data });
  }

  desactivar(id: number) {
    return this.prisma.mesa.update({ where: { id }, data: { activa: false } });
  }
}
