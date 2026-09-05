import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AgentApiKeyGuard } from '../../auth/guards/agent-api-key.guard.js';
import { CreateBookingDto } from '../../api/booking/dto/create-booking.dto.js';
import { CreateBookingPipe } from '../../api/booking/pipes/create-booking.pipe.js';
import { BookingService } from '../../api/booking/booking.service.js';
import { CreateOrderDto } from '../../api/order/dto/create-order.dto.js';
import { CreateOrderPipe } from '../../api/order/pipes/create-order.pipe.js';
import { OrderService } from '../../api/order/order.service.js';
import { CreateTicketDto } from '../../api/tickets/dto/create-ticket.dto.js';
import { UpdateTicketDto } from '../../api/tickets/dto/update-ticket.dto.js';
import { CreateTicketPipe } from '../../api/tickets/pipes/create-ticket.pipe.js';
import { UpdateTicketPipe } from '../../api/tickets/pipes/update-ticket.pipe.js';
import { TicketsService } from '../../api/tickets/tickets.service.js';
import { MensajeEntranteDto } from '../../api/messages/dto/mensaje-entrante.dto.js';
import { MensajeEntrantePipe } from '../../api/messages/pipes/mensaje-entrante.pipe.js';
import { MessagesService } from '../../api/messages/messages.service.js';
import { N8nService } from './n8n.service.js';

/**
 * Rutas exclusivas para el agente de n8n (ver server/docs/plan-mensajes-webhooks.md).
 * Autenticadas por API key (AgentApiKeyGuard), no por JWT — están excluidas de
 * AuthMiddleware en app.module.ts.
 */
@Controller('webhooks/n8n')
@UseGuards(AgentApiKeyGuard)
export class N8nController {
  constructor(
    private readonly n8nService: N8nService,
    private readonly messagesService: MessagesService,
    private readonly bookingService: BookingService,
    private readonly orderService: OrderService,
    private readonly ticketsService: TicketsService,
  ) {}

  @Post('mensajes')
  @HttpCode(HttpStatus.CREATED)
  registrarMensaje(@Body(MensajeEntrantePipe) dto: MensajeEntranteDto) {
    return this.messagesService.registrarMensajeEntrante(dto);
  }

  @Post('reservas')
  @HttpCode(HttpStatus.CREATED)
  async crearReserva(@Body(CreateBookingPipe) dto: CreateBookingDto) {
    const agentUserId = await this.n8nService.getAgentUserId();
    return this.bookingService.create(dto, agentUserId);
  }

  @Post('pedidos')
  @HttpCode(HttpStatus.CREATED)
  async crearPedido(@Body(CreateOrderPipe) dto: CreateOrderDto) {
    const agentUserId = await this.n8nService.getAgentUserId();
    return this.orderService.create(dto, agentUserId);
  }

  @Post('tickets')
  @HttpCode(HttpStatus.CREATED)
  async crearTicket(@Body(CreateTicketPipe) dto: CreateTicketDto) {
    const agentUserId = await this.n8nService.getAgentUserId();
    return this.ticketsService.create(dto, agentUserId);
  }

  @Patch('tickets/:id')
  actualizarTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body(UpdateTicketPipe) dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, dto);
  }
}
