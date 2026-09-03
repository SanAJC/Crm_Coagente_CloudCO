import { Module } from '@nestjs/common';
import { ClientesRepository } from '../../repository/clientes.repository.js';
import { ClientsController } from './clients.controller.js';
import { ClientsService } from './clients.service.js';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ClientesRepository],
})
export class ClientsModule {}
