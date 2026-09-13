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
import { Perms } from '../../../auth/decorators/perm.decorator.js';
import { PermsGuard } from '../../../auth/guards/perm.decorator.js';
import { CreateMesaDto } from './dto/create-mesa.dto.js';
import { UpdateMesaDto } from './dto/update-mesa.dto.js';
import { CreateMesaPipe } from './pipes/create-mesa.pipe.js';
import { UpdateMesaPipe } from './pipes/update-mesa.pipe.js';
import { MesasService } from './mesas.service.js';

@Controller('settings/mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Get()
  findAll(@Query('activa') activa?: string) {
    const filtro = activa === undefined ? undefined : activa === 'true';
    return this.mesasService.findAll(filtro);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermsGuard)
  @Perms('configuracion.gestionar')
  create(@Body(CreateMesaPipe) dto: CreateMesaDto) {
    return this.mesasService.create(dto);
  }

  @Patch(':id')
  @UseGuards(PermsGuard)
  @Perms('configuracion.gestionar')
  update(@Param('id', ParseIntPipe) id: number, @Body(UpdateMesaPipe) dto: UpdateMesaDto) {
    return this.mesasService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermsGuard)
  @Perms('configuracion.gestionar')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mesasService.desactivar(id);
  }
}
