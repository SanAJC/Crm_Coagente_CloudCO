import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.js';
import { RefreshTokenDto } from './dto/refresh_token.js';
import { LogoutDto } from './dto/logout.js';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle( { default: {ttl: 60000, limit: 5}})
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Throttle( { default: {ttl: 60000, limit: 2}})
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Throttle( { default: {ttl: 60000, limit: 2}})
  @Post('logout')
  logout(
    @Headers('authorization') authorization: string | undefined,
    @Body() logoutDto: LogoutDto,
  ) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const accessToken = authorization.split(' ')[1];
    return this.authService.logout(accessToken, logoutDto);
  }
}