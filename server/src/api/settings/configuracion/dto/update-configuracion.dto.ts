import { IsArray, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class UpdateConfiguracionDto {
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'horaApertura debe tener formato HH:mm' })
  horaApertura?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'horaCierre debe tener formato HH:mm' })
  horaCierre?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  intervaloMinutos?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bufferMinutos?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  tamanoMaximoGrupo?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  diasCerrados?: number[];
}
