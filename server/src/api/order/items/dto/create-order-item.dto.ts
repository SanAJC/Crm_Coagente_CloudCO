import { IsInt, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  productoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}
