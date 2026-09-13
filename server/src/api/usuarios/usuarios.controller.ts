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
  UseGuards,
} from '@nestjs/common';
import { Perms } from '../../auth/decorators/perm.decorator.js';
import { AdminGuard } from '../../auth/guards/admin.guard.js';
import { PermsGuard } from '../../auth/guards/perm.decorator.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { CreateUsuarioPipe } from './pipes/create-usuario.pipe.js';
import { UpdateUsuarioPipe } from './pipes/update-usuario.pipe.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Lista liviana (id + nombre) para dropdowns de asignación (p. ej. tickets).
   * A propósito NO lleva AdminGuard/PermsGuard: cualquier usuario logueado
   * puede ver nombres de compañeros activos, pero no el resto de sus datos.
   */
  @Get('asignables')
  findAsignables() {
    return this.usuariosService.findAsignables();
  }

  @Get()
  @UseGuards(AdminGuard, PermsGuard)
  @Perms('usuarios.administrar')
  findAll(@Query('estado') estado?: string) {
    return this.usuariosService.findAll(estado);
  }

  @Get(':id')
  @UseGuards(AdminGuard, PermsGuard)
  @Perms('usuarios.administrar')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminGuard, PermsGuard)
  @Perms('usuarios.administrar')
  create(@Body(CreateUsuarioPipe) dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard, PermsGuard)
  @Perms('usuarios.administrar')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(UpdateUsuarioPipe) dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard, PermsGuard)
  @Perms('usuarios.administrar')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.desactivar(id);
  }
}
