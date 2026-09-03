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
  UsePipes,
} from '@nestjs/common';
import type { Request } from 'express';
import { Perms } from '../../auth/decorators/perm.decorator.js';
import { PermsGuard } from '../../auth/guards/perm.decorator.js';
import { BookingService } from './booking.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { CreateBookingPipe } from './pipes/create-booking.pipe.js';
import { UpdateBookingPipe } from './pipes/update-booking.pipe.js';

@Controller('reservas')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.bookingService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermsGuard)
  @Perms('reservas.gestionar')
  @UsePipes(CreateBookingPipe)
  create(@Body() dto: CreateBookingDto, @Req() req: Request) {
    const user = (req as Request & { user?: { userId?: number } }).user;
    if (!user?.userId) {
      throw new UnauthorizedException('No se encontró el usuario autenticado');
    }
    return this.bookingService.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(PermsGuard)
  @Perms('reservas.gestionar')
  @UsePipes(UpdateBookingPipe)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingDto) {
    return this.bookingService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermsGuard)
  @Perms('reservas.gestionar')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.cancelar(id);
  }
}
