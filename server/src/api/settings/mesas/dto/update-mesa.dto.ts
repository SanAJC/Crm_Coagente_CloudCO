import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateMesaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
