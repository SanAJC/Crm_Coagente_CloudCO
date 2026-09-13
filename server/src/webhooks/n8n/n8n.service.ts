import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientesRepository } from '../../repository/clientes.repository.js';
import { MensajesRepository } from '../../repository/mensajes.repository.js';

const AGENT_USER_EMAIL = 'agente-ia@sistema.local';

@Injectable()
export class N8nService {
  private agentUserId: number | null = null;

  constructor(
    private readonly mensajesRepository: MensajesRepository,
    private readonly clientesRepository: ClientesRepository,
  ) {}

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

  async resolverCliente(canal: string, canalChatId: string, nombre?: string): Promise<number> {
    const conversacion = await this.mensajesRepository.upsertConversacion(canal, canalChatId);
    if (conversacion.clienteId) {
      return conversacion.clienteId;
    }

    const cliente = await this.clientesRepository.create({
      nombre: nombre?.trim() || `Cliente ${canal} ${canalChatId}`,
    });

    await this.mensajesRepository.actualizarConversacion(conversacion.id, {
      clienteId: cliente.id,
    });

    return cliente.id;
  }
}
