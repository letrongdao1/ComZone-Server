import { ApiProperty } from '@nestjs/swagger';

export class UserAddressDTO {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  phone: string;

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
    default: false,
  })
  isDefault: boolean;
}
