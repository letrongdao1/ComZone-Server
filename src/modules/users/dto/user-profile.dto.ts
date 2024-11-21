import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDTO {
  @ApiProperty({ nullable: true })
  name?: string;

  @ApiProperty({ nullable: true })
  phone?: string;

  @ApiProperty({ nullable: true })
  avatar?: string;
}
