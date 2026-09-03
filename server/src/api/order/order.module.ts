import { Module } from '@nestjs/common';
import { PedidosRepository } from '../../repository/pedidos.repository.js';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PedidosRepository],
})
export class OrderModule {}
