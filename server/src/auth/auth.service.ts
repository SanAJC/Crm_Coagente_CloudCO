import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { JwtGeneratedService } from './utils/jwt_generated.js';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

    private async buildDataUser(usuario: { id: number; nombre: string; email: string; estado: string; usuariosRoles: { roleId: number }[] }) {
        const roleId = usuario.usuariosRoles[0]?.roleId;
        if (roleId === undefined) {
            throw new UnauthorizedException('User has no role assigned');
        }
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            role: roleId,
            estado: usuario.estado === 'activo',
        };
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
        const data_user = await this.buildDataUser(user);
        const accessToken = await this.jwtGeneratedService.generateAccessToken(
            user.id,
            data_user.role,
        );
        const refreshToken = await this.jwtGeneratedService.generateAndStoreRefreshToken(
            user.id,
        );
        return { accessToken, refreshToken, data_user };
    }

    async me(userId: number) {
        const user = await this.prisma.usuario.findUnique({
            where: { id: userId },
            include: {
                usuariosRoles: {
                    include: { role: true }
                }
            }
        });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return this.buildDataUser(user);
    }

    async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        try {
          const payload = jwt.verify(
            refreshToken,
            this.jwtRefreshSecret,
          ) as jwt.JwtPayload;

          if (payload.type !== 'refresh' || !payload.jti || !payload.userId) {
            throw new UnauthorizedException('Invalid refresh token');
          }

          const stored = await this.prisma.refreshToken.findFirst({
            where: {
              jti: String(payload.jti),
              tokenHash: this.jwtGeneratedService.hashToken(refreshToken),
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
          const newRefreshToken = await this.jwtGeneratedService.generateAndStoreRefreshToken(
            user.id,
          );

          return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
          throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(accessToken: string, refreshToken?: string): Promise<{ message: string }> {
        await this.jwtGeneratedService.blacklistAccessToken(accessToken, 'logout');

        if (refreshToken) {
          await this.jwtGeneratedService.revokeRefreshToken(refreshToken);
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
