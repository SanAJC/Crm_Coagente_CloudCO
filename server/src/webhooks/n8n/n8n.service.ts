import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MensajesRepository } from '../../repository/mensajes.repository.js';
import type { MensajeEntranteDto } from './dto/mensaje-entrante.dto.js';

const AGENT_USER_EMAIL = 'agente-ia@sistema.local';

@Injectable()
export class N8nService {
  private agentUserId: number | null = null;

  constructor(private readonly mensajesRepository: MensajesRepository) {}

  async getAgentUserId(): Promise<number> {
    if (this.agentUserId !== null) {
      return this.agentUserId;
    }

    const usuario = await this.mensajesRepository.findUsuarioByEmail(AGENT_USER_EMAIL);
    if (!usuario) {
      throw new InternalServerErrorException(
        `No existe el usuario de sistema '${AGENT_USER_EMAIL}' (ver migracion seed_agente_ia_usuario)`,
      );
    }

    this.agentUserId = usuario.id;
    return usuario.id;
  }

  registrarMensajeEntrante(dto: MensajeEntranteDto) {
    return this.mensajesRepository.crearMensajeEntrante({
      canal: dto.canal,
      canalChatId: dto.canalChatId,
      clienteId: dto.clienteId,
      canalMensajeId: dto.canalMensajeId,
      remitente: dto.remitente,
      tipoContenido: dto.tipoContenido,
      contenido: dto.contenido,
      urlAdjunto: dto.urlAdjunto,
      metadata: dto.metadata,
    });
  }
}
