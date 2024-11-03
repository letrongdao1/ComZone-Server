import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDTO {
  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  paymentMethod: 'WALLET' | 'COD';

  @ApiProperty()
  fromName: string;

  @ApiProperty()
  fromPhone: string;

  @ApiProperty()
  fromAddress: string;

  @ApiProperty()
  fromProvinceName: string;

  @ApiProperty()
  fromDistrictId: number;

  @ApiProperty()
  fromDistrictName: string;

  @ApiProperty()
  fromWardId: string;

  @ApiProperty()
  fromWardName: string;

  @ApiProperty()
  toName: string;

  @ApiProperty()
  toPhone: string;

  @ApiProperty()
  toAddress: string;

  @ApiProperty()
  toDistrictId: number;

  @ApiProperty()
  toWardId: string;

  @ApiProperty()
  deliveryFee: number;

  @ApiProperty()
  addressId: string;

  @ApiProperty({ nullable: true })
  note?: string;
}
