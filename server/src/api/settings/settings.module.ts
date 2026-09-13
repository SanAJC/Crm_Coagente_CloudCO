import { Module } from '@nestjs/common';
import { ConfiguracionRepository } from '../../repository/configuracion.repository.js';
import { MesasRepository } from '../../repository/mesas.repository.js';
import { ConfiguracionController } from './configuracion/configuracion.controller.js';
import { ConfiguracionService } from './configuracion/configuracion.service.js';
import { MesasController } from './mesas/mesas.controller.js';
import { MesasService } from './mesas/mesas.service.js';

@Module({
  controllers: [MesasController, ConfiguracionController],
  providers: [MesasService, MesasRepository, ConfiguracionService, ConfiguracionRepository],
})
export class SettingsModule {}
