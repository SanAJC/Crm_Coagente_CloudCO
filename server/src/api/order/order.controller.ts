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
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { CreateOrderPipe } from './pipes/create-order.pipe.js';
import { UpdateOrderPipe } from './pipes/update-order.pipe.js';
import { OrderService } from './order.service.js';

@Controller('pedidos')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.orderService.findAll(estado);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermsGuard)
  @Perms('pedidos.gestionar')
  @UsePipes(CreateOrderPipe)
  create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const user = (req as Request & { user?: { userId?: number } }).user;
    if (!user?.userId) {
      throw new UnauthorizedException('No se encontró el usuario autenticado');
    }
    return this.orderService.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(PermsGuard)
  @Perms('pedidos.gestionar')
  @UsePipes(UpdateOrderPipe)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermsGuard)
  @Perms('pedidos.gestionar')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.cancelar(id);
  }
}
