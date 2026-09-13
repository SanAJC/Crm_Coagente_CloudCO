import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const CONFIG_ID = 1;

export interface ActualizarConfiguracionData {
  horaApertura?: string;
  horaCierre?: string;
  intervaloMinutos?: number;
  bufferMinutos?: number;
  tamanoMaximoGrupo?: number;
  diasCerrados?: number[];
}

@Injectable()
export class ConfiguracionRepository {
  constructor(private readonly prisma: PrismaService) {}

  get() {
    return this.prisma.configuracionNegocio.upsert({
      where: { id: CONFIG_ID },
      update: {},
      create: { id: CONFIG_ID },
    });
  }

  update(data: ActualizarConfiguracionData) {
    return this.prisma.configuracionNegocio.upsert({
      where: { id: CONFIG_ID },
      update: data,
      create: { id: CONFIG_ID, ...data },
    });
  }
}
