import { ApiProperty } from '@nestjs/swagger';

export class GetDeliveryFeeDTO {
  @ApiProperty()
  fromDistrict: number;

  @ApiProperty()
  fromWard: string;

  @ApiProperty()
  toDistrict: number;

  @ApiProperty()
  toWard: string;

  @ApiProperty()
  comicsQuantity: number;
}
