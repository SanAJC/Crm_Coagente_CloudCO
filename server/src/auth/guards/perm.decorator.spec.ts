import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermsGuard } from './perm.decorator.js';
import type { PrismaService } from '../../database/prisma.service.js';

function crearContexto(user: { role: number } | undefined): ExecutionContext {
  return {
    getHandler: () => vi.fn(),
    getClass: () => vi.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('PermsGuard', () => {
  let reflector: Reflector;
  let prisma: PrismaService;
  let guard: PermsGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() } as unknown as Reflector;
    prisma = {
      rolePermiso: { findMany: vi.fn() },
    } as unknown as PrismaService;
    guard = new PermsGuard(reflector, prisma);
  });

  it('permite el acceso cuando la ruta no requiere permisos', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(undefined);

    await expect(guard.canActivate(crearContexto(undefined))).resolves.toBe(
      true,
    );
  });

  it('rechaza el acceso cuando el token no trae rol', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue([
      'productos.crear',
    ]);

    await expect(guard.canActivate(crearContexto(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('permite el acceso cuando el rol tiene todos los permisos requeridos', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue([
      'productos.crear',
      'productos.editar',
    ]);
    vi.mocked(prisma.rolePermiso.findMany).mockResolvedValue([
      { permiso: { nombre: 'productos.crear' } },
      { permiso: { nombre: 'productos.editar' } },
      { permiso: { nombre: 'productos.eliminar' } },
    ] as never);

    await expect(
      guard.canActivate(crearContexto({ role: 1 })),
    ).resolves.toBe(true);
    expect(prisma.rolePermiso.findMany).toHaveBeenCalledWith({
      where: { roleId: 1 },
      include: { permiso: true },
    });
  });

  it('rechaza el acceso cuando al rol le falta algun permiso requerido', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue([
      'productos.crear',
      'usuarios.administrar',
    ]);
    vi.mocked(prisma.rolePermiso.findMany).mockResolvedValue([
      { permiso: { nombre: 'productos.crear' } },
    ] as never);

    await expect(
      guard.canActivate(crearContexto({ role: 1 })),
    ).rejects.toThrow(ForbiddenException);
  });
});
