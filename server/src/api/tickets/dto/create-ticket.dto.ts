import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  asunto: string;

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
  @IsInt()
  asignadoA?: number;
}
