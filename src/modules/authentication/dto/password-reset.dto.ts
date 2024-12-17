import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDTO {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  oldPassword: string;

  @ApiProperty()
  newPassword: string;
}

export class ChangePasswordDTO {
  @ApiProperty()
  oldPassword: string;

  @ApiProperty()
  newPassword: string;
}
