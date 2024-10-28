import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDTO {
  @ApiProperty()
  order: string;

  @ApiProperty()
  comics: string;
}
