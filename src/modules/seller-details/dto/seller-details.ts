import { ApiProperty } from '@nestjs/swagger';

export class SellerDetailsDTO {
  @ApiProperty()
  verifiedPhone: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  ward: string;

  @ApiProperty()
  detailedAddress: string;
}
