import { Module } from '@nestjs/common';
import { BookingModule } from '../../api/booking/booking.module.js';
import { MessagesModule } from '../../api/messages/messages.module.js';
import { OrderModule } from '../../api/order/order.module.js';
import { ProductsModule } from '../../api/products/products.module.js';
import { TicketsModule } from '../../api/tickets/tickets.module.js';
import { ClientesRepository } from '../../repository/clientes.repository.js';
import { MensajesRepository } from '../../repository/mensajes.repository.js';
import { N8nController } from './n8n.controller.js';
import { N8nService } from './n8n.service.js';

@Module({
  imports: [BookingModule, OrderModule, TicketsModule, MessagesModule, ProductsModule],
  controllers: [N8nController],
  providers: [N8nService, MensajesRepository, ClientesRepository],
})
export class N8nModule {}
