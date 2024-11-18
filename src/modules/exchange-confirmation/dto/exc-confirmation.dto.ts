import { ApiProperty } from '@nestjs/swagger';

export class CreateDTO {
  @ApiProperty()
  exchangeId: string;

  @ApiProperty()
  userId: string;
}
