import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Module({
  controllers: [],
  providers: [AuthService],
})
export class AuthModule {}