import { Injectable } from '@nestjs/common';
import { ConfiguracionRepository } from '../../../repository/configuracion.repository.js';
import type { UpdateConfiguracionDto } from './dto/update-configuracion.dto.js';

@Injectable()
export class ConfiguracionService {
  constructor(private readonly configuracionRepository: ConfiguracionRepository) {}

  get() {
    return this.configuracionRepository.get();
  }

  update(dto: UpdateConfiguracionDto) {
    return this.configuracionRepository.update(dto);
  }
}
