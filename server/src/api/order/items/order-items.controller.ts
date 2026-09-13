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
import { CreateOrderItemDto } from './dto/create-order-item.dto.js';
import { UpdateOrderItemDto } from './dto/update-order-item.dto.js';
import { CreateOrderItemPipe } from './pipes/create-order-item.pipe.js';
import { UpdateOrderItemPipe } from './pipes/update-order-item.pipe.js';
import { OrderItemsService } from './order-items.service.js';

@Controller('pedidos/:pedidoId/items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get()
  findByPedido(@Param('pedidoId', ParseIntPipe) pedidoId: number) {
    return this.orderItemsService.findByPedido(pedidoId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermsGuard)
  @Perms('pedidos.gestionar')
  create(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Body(CreateOrderItemPipe) dto: CreateOrderItemDto,
  ) {
    return this.orderItemsService.create(pedidoId, dto);
  }

  @Patch(':itemId')
  @UseGuards(PermsGuard)
  @Perms('pedidos.gestionar')
  update(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body(UpdateOrderItemPipe) dto: UpdateOrderItemDto,
  ) {
    return this.orderItemsService.update(pedidoId, itemId, dto);
  }

  @Delete(':itemId')
  @UseGuards(PermsGuard)
  @Perms('pedidos.gestionar')
  remove(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.orderItemsService.remove(pedidoId, itemId);
  }
}
