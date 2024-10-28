import { ApiProperty } from '@nestjs/swagger';

export class SellerInformationDTO {
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

  @ApiProperty({
    nullable: true,
    enum: ['PENDING', 'APPROVED'],
    default: 'PENDING',
  })
  registerStatus: string;
}
