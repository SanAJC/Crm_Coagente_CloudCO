import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductosRepository } from '../../repository/productos.repository.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly productosRepository: ProductosRepository) {}

  findAll(estado?: string) {
    return this.productosRepository.findAll(estado);
  }

  async findOne(id: number) {
    const producto = await this.productosRepository.findById(id);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async create(dto: CreateProductDto, creadoPorId: number) {
    const existente = await this.productosRepository.findBySku(dto.sku);
    if (existente) {
      throw new ConflictException('Ya existe un producto con ese sku');
    }

    if (dto.categoriaId !== undefined) {
      await this.validarCategoria(dto.categoriaId);
    }

    return this.productosRepository.create({
      sku: dto.sku,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      categoriaId: dto.categoriaId,
      precio: dto.precio,
      costo: dto.costo,
      stockActual: dto.stockActual,
      stockMinimo: dto.stockMinimo,
      imagenUrl: dto.imagenUrl,
      createdBy: creadoPorId,
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.sku) {
      const existente = await this.productosRepository.findBySku(dto.sku);
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe un producto con ese sku');
      }
    }

    if (dto.categoriaId !== undefined) {
      await this.validarCategoria(dto.categoriaId);
    }

    return this.productosRepository.update(id, dto);
  }

  async desactivar(id: number) {
    await this.findOne(id);
    return this.productosRepository.actualizarEstado(id, 'descontinuado');
  }

  private async validarCategoria(categoriaId: number) {
    const categoria = await this.productosRepository.findCategoriaById(categoriaId);
    if (!categoria) {
      throw new BadRequestException('La categoría indicada no existe');
    }
  }
}
