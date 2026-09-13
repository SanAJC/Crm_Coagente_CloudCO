import { Module } from '@nestjs/common';
import { PedidoDetalleRepository } from '../../repository/pedido-detalle.repository.js';
import { PedidosRepository } from '../../repository/pedidos.repository.js';
import { OrderItemsController } from './items/order-items.controller.js';
import { OrderItemsService } from './items/order-items.service.js';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';

@Module({
  controllers: [OrderController, OrderItemsController],
  providers: [OrderService, PedidosRepository, OrderItemsService, PedidoDetalleRepository],
  exports: [OrderService],
})
export class OrderModule {}
