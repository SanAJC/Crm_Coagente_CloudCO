import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsInt()
  clienteId?: number;

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  personas?: number;

  @IsOptional()
  @IsInt()
  mesaId?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsIn(['pendiente', 'confirmada', 'cancelada', 'completada'])
  estado?: string;
}
