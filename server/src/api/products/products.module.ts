import { Module } from '@nestjs/common';
import { CategoriasRepository } from '../../repository/categorias.repository.js';
import { ProductosRepository } from '../../repository/productos.repository.js';
import { CategoriasController } from './categorias/categorias.controller.js';
import { CategoriasService } from './categorias/categorias.service.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  controllers: [ProductsController, CategoriasController],
  providers: [
    ProductsService,
    ProductosRepository,
    CategoriasService,
    CategoriasRepository,
  ],
})
export class ProductsModule {}
