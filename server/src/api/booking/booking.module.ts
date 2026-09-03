import { Module } from '@nestjs/common';
import { ReservasRepository } from '../../repository/reservas.repository.js';
import { BookingController } from './booking.controller.js';
import { BookingService } from './booking.service.js';

@Module({
  controllers: [BookingController],
  providers: [BookingService, ReservasRepository],
})
export class BookingModule {}
