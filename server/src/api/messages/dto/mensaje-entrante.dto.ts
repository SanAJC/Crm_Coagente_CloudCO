import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class MensajeEntranteDto {
  @IsIn(['telegram', 'whatsapp', 'instagram'])
  canal: string;

  @IsString()
  @IsNotEmpty()
  canalChatId: string;

  @IsIn(['cliente', 'agente', 'sistema'])
  remitente: string;

  @IsOptional()
  @IsString()
  canalMensajeId?: string;

  @IsOptional()
  @IsIn(['texto', 'imagen', 'audio', 'video', 'documento', 'ubicacion'])
  tipoContenido?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  urlAdjunto?: string;

  @IsOptional()
  @IsObject()
  metadata?: object;

  @IsOptional()
  @IsInt()
  clienteId?: number;
}
