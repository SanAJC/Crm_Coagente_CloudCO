import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Autentica las rutas /webhooks/n8n/* con una clave estatica (AGENT_API_KEY),
 * sin pasar por AuthMiddleware ni por JWT. Ver server/docs/plan-mensajes-webhooks.md.
 */
@Injectable()
export class AgentApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.AGENT_API_KEY;
    if (!expected) {
      throw new InternalServerErrorException('AGENT_API_KEY no está configurada');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-agent-api-key'];

    if (apiKey !== expected) {
      throw new UnauthorizedException('API key inválida');
    }

    return true;
  }
}
