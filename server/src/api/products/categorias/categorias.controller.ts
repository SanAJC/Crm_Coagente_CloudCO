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
  UseGuards,
} from '@nestjs/common';
import { Perms } from '../../../auth/decorators/perm.decorator.js';
import { PermsGuard } from '../../../auth/guards/perm.decorator.js';
import { CategoriasService } from './categorias.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { CreateCategoriaPipe } from './pipes/create-categoria.pipe.js';
import { UpdateCategoriaPipe } from './pipes/update-categoria.pipe.js';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermsGuard)
  @Perms('productos.crear')
  create(@Body(CreateCategoriaPipe) dto: CreateCategoriaDto) {
    return this.categoriasService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermsGuard)
  @Perms('productos.editar')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(UpdateCategoriaPipe) dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermsGuard)
  @Perms('productos.eliminar')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
