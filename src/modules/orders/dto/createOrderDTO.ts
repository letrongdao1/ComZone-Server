import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDTO {
  @ApiProperty()
  sellerId: string;

  @ApiProperty()
  deliveryId: string;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  paymentMethod: 'WALLET' | 'COD';

  @ApiProperty()
  addressId: string;

  @ApiProperty()
  type?: string;

  @ApiProperty()
  depositAmount?: number;

  @ApiProperty({ nullable: true })
  note?: string;
}
