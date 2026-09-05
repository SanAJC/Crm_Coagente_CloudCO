import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Perms } from '../../auth/decorators/perm.decorator.js';
import { PermsGuard } from '../../auth/guards/perm.decorator.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CreateProductPipe } from './pipes/create-product.pipe.js';
import { UpdateProductPipe } from './pipes/update-product.pipe.js';
import { ProductsService } from './products.service.js';

@Controller('productos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.productsService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermsGuard)
  @Perms('productos.crear')
  create(@Body(CreateProductPipe) dto: CreateProductDto, @Req() req: Request) {
    const user = (req as Request & { user?: { userId?: number } }).user;
    if (!user?.userId) {
      throw new UnauthorizedException('No se encontró el usuario autenticado');
    }
    return this.productsService.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(PermsGuard)
  @Perms('productos.editar')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(UpdateProductPipe) dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermsGuard)
  @Perms('productos.eliminar')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.desactivar(id);
  }
}
