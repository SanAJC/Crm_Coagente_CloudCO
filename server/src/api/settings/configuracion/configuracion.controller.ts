import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Perms } from '../../../auth/decorators/perm.decorator.js';
import { PermsGuard } from '../../../auth/guards/perm.decorator.js';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto.js';
import { UpdateConfiguracionPipe } from './pipes/update-configuracion.pipe.js';
import { ConfiguracionService } from './configuracion.service.js';

@Controller('settings/negocio')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get()
  get() {
    return this.configuracionService.get();
  }

  @Patch()
  @UseGuards(PermsGuard)
  @Perms('configuracion.gestionar')
  update(@Body(UpdateConfiguracionPipe) dto: UpdateConfiguracionDto) {
    return this.configuracionService.update(dto);
  }
}
