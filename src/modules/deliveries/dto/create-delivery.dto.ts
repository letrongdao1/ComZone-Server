import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryDTO {
  @ApiProperty({ nullable: true })
  order?: string;

  @ApiProperty({ nullable: true })
  exchangeRequest?: string;

  @ApiProperty({ nullable: true })
  exchangeOffer?: string;

  @ApiProperty()
  fromName: string;

  @ApiProperty()
  fromPhone: string;

  @ApiProperty()
  fromProvinceId: number;

  @ApiProperty()
  fromDistrictId: number;

  @ApiProperty()
  fromWardId: string;

  @ApiProperty()
  fromAddress: string;

  @ApiProperty()
  toName: string;

  @ApiProperty()
  toPhone: string;

  @ApiProperty()
  toProvinceId: number;

  @ApiProperty()
  toDistrictId: number;
  
  @ApiProperty()
  toWardId: string;

  @ApiProperty()
  toAddress: string;
}
