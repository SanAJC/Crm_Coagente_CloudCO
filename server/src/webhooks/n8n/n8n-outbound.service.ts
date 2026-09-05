import { Injectable, Logger } from '@nestjs/common';

export interface MensajeSalienteParaPlataforma {
  canal: string;
  canalChatId: string;
  tipoContenido: string;
  contenido: string | null;
  urlAdjunto: string | null;
  mensajeId: number;
}

/**
 * Entrega un mensaje humano a la plataforma real (WhatsApp/Telegram/Instagram)
 * llamando al webhook de salida expuesto por n8n. El backend no tiene
 * credenciales de esas plataformas -- solo n8n las tiene.
 * Ver server/docs/plan-mensajes-webhooks.md (flujo 3).
 */
@Injectable()
export class N8nOutboundService {
  private readonly logger = new Logger(N8nOutboundService.name);

  async enviarAPlataforma(payload: MensajeSalienteParaPlataforma): Promise<boolean> {
    const url = process.env.N8N_OUTBOUND_WEBHOOK_URL;
    if (!url) {
      this.logger.warn(
        'N8N_OUTBOUND_WEBHOOK_URL no configurada; el mensaje quedó guardado pero no se entregó a la plataforma',
      );
      return false;
    }

    const apiKey = process.env.N8N_OUTBOUND_API_KEY;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-Outbound-Api-Key': apiKey } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        this.logger.error(
          `n8n rechazó la entrega del mensaje ${payload.mensajeId}: HTTP ${res.status}`,
        );
      }

      return res.ok;
    } catch (error) {
      this.logger.error(
        `Fallo al llamar al webhook de salida de n8n para el mensaje ${payload.mensajeId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }
}
