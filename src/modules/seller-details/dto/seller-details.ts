import { ApiProperty } from '@nestjs/swagger';

export class SellerDetailsDTO {
  @ApiProperty()
  verifiedPhone: string;

  @ApiProperty()
  province: number;

  @ApiProperty()
  district: number;

  @ApiProperty()
  ward: number;

  @ApiProperty()
  detailedAddress: string;
}
