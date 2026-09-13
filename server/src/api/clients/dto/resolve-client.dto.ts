import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResolveClientDto {
  @IsIn(['telegram', 'whatsapp', 'instagram'])
  canal: string;

  @IsString()
  @IsNotEmpty()
  canalChatId: string;

  @IsOptional()
  @IsString()
  nombre?: string;
}
