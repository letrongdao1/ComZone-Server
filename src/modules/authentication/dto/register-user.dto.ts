import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDTO {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  avatar: string;
}
