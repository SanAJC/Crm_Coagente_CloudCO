import { IsIn, IsInt, IsOptional } from 'class-validator';

export class UpdateConversationDto {
  @IsOptional()
  @IsIn(['abierta', 'cerrada', 'archivada'])
  estado?: string;

  @IsOptional()
  @IsInt()
  clienteId?: number;
}
