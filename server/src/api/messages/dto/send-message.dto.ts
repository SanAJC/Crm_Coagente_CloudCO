import { IsIn, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsIn(['texto', 'imagen', 'audio', 'video', 'documento', 'ubicacion'])
  tipoContenido?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  urlAdjunto?: string;
}
