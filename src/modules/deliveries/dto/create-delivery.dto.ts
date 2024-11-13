import { ApiProperty } from '@nestjs/swagger';

export class CreateExchangeRequestDeliveryDTO {
  @ApiProperty()
  exchangeRequest: string;

  @ApiProperty({ example: 'ID of delivery information' })
  addressId: string;
}

export class CreateExchangeOfferDeliveryDTO {
  @ApiProperty()
  exchangeOffer: string;

  @ApiProperty({ example: 'ID of delivery information' })
  addressId: string;
}
