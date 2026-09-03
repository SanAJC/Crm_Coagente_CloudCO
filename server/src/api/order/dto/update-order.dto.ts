import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsInt()
  clienteId?: number;

  @IsOptional()
  @IsInt()
  reservaId?: number;

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;

  @IsOptional()
  @IsString()
  direccionEnvio?: string;

  @IsOptional()
  @IsIn(['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado'])
  estado?: string;
}
