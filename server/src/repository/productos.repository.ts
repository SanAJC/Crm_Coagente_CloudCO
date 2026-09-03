import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const PRODUCTO_SELECT = {
  id: true,
  sku: true,
  nombre: true,
  descripcion: true,
  categoriaId: true,
  precio: true,
  costo: true,
  stockActual: true,
  stockMinimo: true,
  imagenUrl: true,
  estado: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  categoria: { select: { id: true, nombre: true } },
} as const;

export interface CrearProductoData {
  sku: string;
  nombre: string;
  descripcion?: string;
  categoriaId?: number;
  precio: number;
  costo?: number;
  stockActual?: number;
  stockMinimo?: number;
  imagenUrl?: string;
  createdBy: number;
}

export interface ActualizarProductoData {
  sku?: string;
  nombre?: string;
  descripcion?: string;
  categoriaId?: number;
  precio?: number;
  costo?: number;
  stockActual?: number;
  stockMinimo?: number;
  imagenUrl?: string;
  estado?: string;
}

@Injectable()
export class ProductosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(estado?: string) {
    return this.prisma.producto.findMany({
      where: estado ? { estado } : undefined,
      select: PRODUCTO_SELECT,
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.producto.findUnique({
      where: { id },
      select: PRODUCTO_SELECT,
    });
  }

  findBySku(sku: string) {
    return this.prisma.producto.findUnique({ where: { sku } });
  }

  findCategoriaById(categoriaId: number) {
    return this.prisma.categoria.findUnique({ where: { id: categoriaId } });
  }

  create(data: CrearProductoData) {
    return this.prisma.producto.create({ data, select: PRODUCTO_SELECT });
  }

  update(id: number, data: ActualizarProductoData) {
    return this.prisma.producto.update({
      where: { id },
      data,
      select: PRODUCTO_SELECT,
    });
  }

  actualizarEstado(id: number, estado: string) {
    return this.prisma.producto.update({
      where: { id },
      data: { estado },
      select: PRODUCTO_SELECT,
    });
  }
}
