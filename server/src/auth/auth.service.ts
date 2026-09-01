import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { JwtGeneratedService } from './utils/jwt_generated.js';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RefreshTokenDto } from './dto/refresh_token.js';
import { LogoutDto } from './dto/logout.js';
import { LoginDto } from './dto/login.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtGeneratedService: JwtGeneratedService,
    ) {}
    private readonly jwtSecret = process.env.JWT_SECRET ?? '';
    private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET ?? this.jwtSecret;

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }

    async login(data : LoginDto): Promise<{ accessToken: string; refreshToken: string; data_user: {} }> {
        const user = await this.prisma.usuario.findUnique({
            where: { email: data.email },
            include: {
                usuariosRoles: {
                    include: { role: true }
                }
            }
        });
        if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const roleId = user.usuariosRoles[0]?.roleId;
        if (roleId === undefined) {
            throw new UnauthorizedException('User has no role assigned');
        }
        const data_user = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            role: roleId,
            estado: user.estado === 'activo'
        };
        const accessToken = await this.jwtGeneratedService.generateAccessToken(
            user.id,
            roleId,
        );
        const refreshToken = await this.jwtGeneratedService.generateAndStoreRefreshToken(
            user.id,
        );
        return { accessToken, refreshToken, data_user };
    }
    async refresh(data: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
        try {
          const payload = jwt.verify(
            data.refreshToken,
            this.jwtRefreshSecret,
          ) as jwt.JwtPayload;

          if (payload.type !== 'refresh' || !payload.jti || !payload.userId) {
            throw new UnauthorizedException('Invalid refresh token');
          }

          const stored = await this.prisma.refreshToken.findFirst({
            where: {
              jti: String(payload.jti),
              tokenHash: this.jwtGeneratedService.hashToken(data.refreshToken),
              revoked: false,
            },
          });

          if (!stored || stored.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expired or revoked');
          }

          await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revoked: true },
          });

          const user = await this.prisma.usuario.findUnique({
            where: { id: Number(payload.userId) },
            include: {
                usuariosRoles: {
                    include: { role: true }
                }
            }
          });
          if (!user) {
            throw new UnauthorizedException('User not found');
          }

          const roleId = user.usuariosRoles[0]?.roleId;
          if (roleId === undefined) {
            throw new UnauthorizedException('User has no role assigned');
          }

          const accessToken = await this.jwtGeneratedService.generateAccessToken(
            user.id,
            roleId,
          );
          const refreshToken = await this.jwtGeneratedService.generateAndStoreRefreshToken(
            user.id,
          );

          return { accessToken, refreshToken };
        } catch (error) {
          throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(accessToken: string, data: LogoutDto): Promise<{ message: string }> {
        await this.jwtGeneratedService.blacklistAccessToken(accessToken, 'logout');

        if (data.refreshToken) {
          await this.jwtGeneratedService.revokeRefreshToken(data.refreshToken);
        }

        return { message: 'Logout successful' };
    }
    
    async validateToken(token: string): Promise<any> {
        try {
            const payload = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
            if (payload.type !== 'access' || !payload.jti || !payload.role) {
              throw new UnauthorizedException('Invalid token type');
            }

            const blacklisted = await this.prisma.blacklistedToken.findUnique({
              where: { jti: String(payload.jti) },
            });
            if (blacklisted && blacklisted.expiresAt > new Date()) {
              throw new UnauthorizedException('Token blacklisted');
            }

            return payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}