import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDeliveryDTO {
  @ApiProperty({ example: "ID of seller's delivery information" })
  fromAddressId: string;

  @ApiProperty({ example: "ID of user's delivery information" })
  toAddressId: string;
}
export class CreateExchangeDeliveryDTO {
  @ApiProperty()
  exchange: string;

  @ApiProperty({ example: 'ID of delivery information' })
  addressId: string;
}

export class CreateExchangeOfferDeliveryDTO {
  @ApiProperty()
  exchangeOffer: string;

  @ApiProperty({ example: 'ID of delivery information' })
  addressId: string;
}
