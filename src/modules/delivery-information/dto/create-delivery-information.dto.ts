import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryInformationDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  provinceId: number;

  @ApiProperty()
  districtId: number;

  @ApiProperty()
  wardId: string;

  @ApiProperty()
  address: string;
}
