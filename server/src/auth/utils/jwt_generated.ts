import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import { randomUUID, createHash } from 'crypto';
import { PrismaService } from '../../database/prisma.service.js';


@Injectable()
export class JwtGeneratedService {
    constructor(private  readonly prisma: PrismaService) {}

    private readonly jwtSecret = process.env.JWT_SECRET ?? '';
    private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET ?? this.jwtSecret;
    private readonly accessTokenTtl = process.env.JWT_ACCESS_EXPIRES_IN ?? '1h';
    private readonly refreshTokenTtl = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

    hashToken(token : string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    async generateAccessToken(userId: number, role: number): Promise<string> {
        return jwt.sign(
            { userId, role, type: 'access', jti: randomUUID() },
            this.jwtSecret,
            { expiresIn: this.accessTokenTtl as jwt.SignOptions['expiresIn'] }
        )
    }
    async generateAndStoreRefreshToken(userId: number): Promise<string> {
        const refreshToken = jwt.sign(
          { userId, type: 'refresh', jti: randomUUID() },
          this.jwtRefreshSecret,
          { expiresIn: this.refreshTokenTtl as jwt.SignOptions['expiresIn'] },
        );

        const payload = jwt.verify(
          refreshToken,
          this.jwtRefreshSecret,
        ) as jwt.JwtPayload;

        await this.prisma.refreshToken.create({
          data: {
            usuarioId: userId,
            tokenHash: this.hashToken(refreshToken),
            jti: String(payload.jti),
            expiresAt: new Date(Number(payload.exp) * 1000),
          },
        });

        return refreshToken;
    }

    async blacklistAccessToken(token: string, reason?: string): Promise<void> {
        const payload = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
        if (payload.type !== 'access' || !payload.jti) {
          throw new UnauthorizedException('Invalid access token');
        }

        const jti = String(payload.jti);
        await this.prisma.blacklistedToken.upsert({
          where: { jti },
          update: { reason: reason ?? 'logout' },
          create: {
            usuarioId: Number(payload.userId),
            jti,
            expiresAt: new Date(Number(payload.exp) * 1000),
            reason: reason ?? 'logout',
          },
        });
    }

    async revokeRefreshToken(refreshToken: string): Promise<void> {
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.refreshToken.updateMany({
          where: { tokenHash, revoked: false },
          data: { revoked: true },
        });
    }

}