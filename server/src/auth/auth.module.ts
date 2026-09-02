import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtGeneratedService } from './utils/jwt_generated.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtGeneratedService],
  exports: [AuthService],
})
export class AuthModule {}