import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UsuariosRepository } from '../../repository/usuarios.repository.js';
import type { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import type { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly usuariosRepository: UsuariosRepository) {}

  async findAll(estado?: string) {
    const usuarios = await this.usuariosRepository.findAll(estado);
    return usuarios.map((usuario) => this.mapUsuario(usuario));
  }

  async findOne(id: number) {
    const usuario = await this.usuariosRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.mapUsuario(usuario);
  }

  async create(dto: CreateUsuarioDto) {
    const existente = await this.usuariosRepository.findByEmail(dto.email);
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const rol = await this.usuariosRepository.findRoleById(dto.roleId);
    if (!rol) {
      throw new BadRequestException('El rol indicado no existe');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.usuariosRepository.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      telefono: dto.telefono,
      roleId: dto.roleId,
    });

    return this.mapUsuario(usuario);
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    if (dto.email) {
      const existente = await this.usuariosRepository.findByEmail(dto.email);
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
    }

    if (dto.roleId !== undefined) {
      const rol = await this.usuariosRepository.findRoleById(dto.roleId);
      if (!rol) {
        throw new BadRequestException('El rol indicado no existe');
      }
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    const usuario = await this.usuariosRepository.update(id, {
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono,
      estado: dto.estado,
      passwordHash,
      roleId: dto.roleId,
    });

    return this.mapUsuario(usuario);
  }

  async desactivar(id: number) {
    await this.findOne(id);
    const usuario = await this.usuariosRepository.actualizarEstado(id, 'inactivo');
    return this.mapUsuario(usuario);
  }

  private mapUsuario(usuario: {
    id: number;
    nombre: string;
    email: string;
    telefono: string | null;
    estado: string;
    ultimoLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    usuariosRoles: { role: { id: number; nombre: string } }[];
  }) {
    const { usuariosRoles, ...resto } = usuario;
    return {
      ...resto,
      role: usuariosRoles[0]?.role ?? null,
    };
  }
}
