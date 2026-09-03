import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  clienteId: number;

  @IsOptional()
  @IsInt()
  reservaId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;

  @IsOptional()
  @IsString()
  direccionEnvio?: string;
}
