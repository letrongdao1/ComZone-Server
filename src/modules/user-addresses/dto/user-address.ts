import { ApiProperty } from '@nestjs/swagger';

export class UserAddressDTO {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  province: number;

  @ApiProperty()
  district: number;

  @ApiProperty()
  ward: number;

  @ApiProperty()
  detailedAddress: string;

  @ApiProperty({
    nullable: true,
    default: false,
  })
  isDefault: boolean;
}
