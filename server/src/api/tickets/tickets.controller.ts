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
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { CreateTicketPipe } from './pipes/create-ticket.pipe.js';
import { UpdateTicketPipe } from './pipes/update-ticket.pipe.js';
import { TicketsService } from './tickets.service.js';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.ticketsService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermsGuard)
  @Perms('tickets.gestionar')
  create(@Body(CreateTicketPipe) dto: CreateTicketDto, @Req() req: Request) {
    const user = (req as Request & { user?: { userId?: number } }).user;
    if (!user?.userId) {
      throw new UnauthorizedException('No se encontró el usuario autenticado');
    }
    return this.ticketsService.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(PermsGuard)
  @Perms('tickets.gestionar')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(UpdateTicketPipe) dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermsGuard)
  @Perms('tickets.gestionar')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.cerrar(id);
  }
}
