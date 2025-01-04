import { ApiProperty } from '@nestjs/swagger';

export class CreateEditionDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}

export class EditEditionDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  description?: string;
}
