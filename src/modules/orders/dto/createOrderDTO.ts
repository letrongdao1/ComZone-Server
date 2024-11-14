import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDTO {
  @ApiProperty()
  deliveryId: string;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  paymentMethod: 'WALLET' | 'COD';

  @ApiProperty()
  addressId: string;

  @ApiProperty({ nullable: true })
  note?: string;
}
