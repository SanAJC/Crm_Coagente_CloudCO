import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service.js';
import { Request, Response, NextFunction } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants.js';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
    if (!token) {
      throw new UnauthorizedException('Access token cookie is missing');
    }

    try {
      const payload = await this.authService.validateToken(token);
      (req as Request & { user?: unknown }).user = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
