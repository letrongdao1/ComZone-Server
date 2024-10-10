import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDTO {
  @ApiProperty()
  order: string;

  @ApiProperty()
  comics: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  total_price: number;
}
