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
@UseGuards(AdminGuard, PermsGuard)
@Perms('usuarios.administrar')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.usuariosService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(CreateUsuarioPipe) dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(UpdateUsuarioPipe) dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.desactivar(id);
  }
}
