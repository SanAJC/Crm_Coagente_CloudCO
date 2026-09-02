import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const USUARIO_SELECT = {
  id: true,
  nombre: true,
  email: true,
  telefono: true,
  estado: true,
  ultimoLogin: true,
  createdAt: true,
  updatedAt: true,
  usuariosRoles: {
    include: { role: true },
  },
} as const;

export interface CrearUsuarioData {
  nombre: string;
  email: string;
  passwordHash: string;
  telefono?: string;
  roleId: number;
}

export interface ActualizarUsuarioData {
  nombre?: string;
  email?: string;
  telefono?: string;
  estado?: string;
  passwordHash?: string;
  roleId?: number;
}

@Injectable()
export class UsuariosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(estado?: string) {
    return this.prisma.usuario.findMany({
      where: estado ? { estado } : undefined,
      select: USUARIO_SELECT,
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: USUARIO_SELECT,
    });
  }

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  findRoleById(roleId: number) {
    return this.prisma.role.findUnique({ where: { id: roleId } });
  }

  create(data: CrearUsuarioData) {
    return this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        passwordHash: data.passwordHash,
        telefono: data.telefono,
        usuariosRoles: { create: { roleId: data.roleId } },
      },
      select: USUARIO_SELECT,
    });
  }

  update(id: number, data: ActualizarUsuarioData) {
    return this.prisma.$transaction(async (tx) => {
      if (data.roleId !== undefined) {
        await tx.usuarioRole.deleteMany({ where: { usuarioId: id } });
      }

      return tx.usuario.update({
        where: { id },
        data: {
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono,
          estado: data.estado,
          passwordHash: data.passwordHash,
          ...(data.roleId !== undefined
            ? { usuariosRoles: { create: { roleId: data.roleId } } }
            : {}),
        },
        select: USUARIO_SELECT,
      });
    });
  }

  actualizarEstado(id: number, estado: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { estado },
      select: USUARIO_SELECT,
    });
  }
}
