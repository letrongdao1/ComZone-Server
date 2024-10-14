import { ApiProperty } from '@nestjs/swagger';

export class RoleDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  role_name: string;
}
