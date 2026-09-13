import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  clienteId: number;

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
}
