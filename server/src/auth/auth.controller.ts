import {
  Controller,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.js';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Throttle } from '@nestjs/throttler';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from './auth.constants.js';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle( { default: {ttl: 60000, limit: 5}})
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, data_user } = await this.authService.login(loginDto);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    return { data_user };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const user = (req as Request & { user?: { userId?: number } }).user;
    if (!user?.userId) {
      throw new UnauthorizedException('No se encontró el usuario autenticado');
    }
    return { data_user: await this.authService.me(user.userId) };
  }

  @Throttle( { default: {ttl: 60000, limit: 2}})
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokens = await this.authService.refresh(refreshToken);
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    return { message: 'Token refreshed' };
  }

  @Throttle( { default: {ttl: 60000, limit: 2}})
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    const result = await this.authService.logout(accessToken, refreshToken);
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE);
    return result;
  }
}
