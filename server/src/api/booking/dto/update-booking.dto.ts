import { IsDateString, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

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
  @IsString()
  notas?: string;

  @IsOptional()
  @IsIn(['pendiente', 'confirmada', 'cancelada', 'completada'])
  estado?: string;
}
