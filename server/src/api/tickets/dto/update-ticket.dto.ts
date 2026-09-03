import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  asunto?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  pedidoId?: number;

  @IsOptional()
  @IsIn(['seguimiento', 'incidencia', 'consulta', 'devolucion'])
  tipo?: string;

  @IsOptional()
  @IsIn(['baja', 'media', 'alta', 'urgente'])
  prioridad?: string;

  @IsOptional()
  @IsIn(['abierto', 'en_proceso', 'resuelto', 'cerrado'])
  estado?: string;

  @IsOptional()
  @IsInt()
  asignadoA?: number;
}
