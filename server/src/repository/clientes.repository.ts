import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

export interface CrearClienteData {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipoCliente?: string;
}

export interface ActualizarClienteData {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipoCliente?: string;
}

@Injectable()
export class ClientesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tipoCliente?: string) {
    return this.prisma.cliente.findMany({
      where: tipoCliente ? { tipoCliente } : undefined,
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.cliente.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.cliente.findUnique({ where: { email } });
  }

  create(data: CrearClienteData) {
    return this.prisma.cliente.create({ data });
  }

  update(id: number, data: ActualizarClienteData) {
    return this.prisma.cliente.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.cliente.delete({ where: { id } });
  }
}
