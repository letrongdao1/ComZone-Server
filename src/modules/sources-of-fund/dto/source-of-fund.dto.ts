import { ApiProperty } from '@nestjs/swagger';

export class SourceOfFundDTO {
  @ApiProperty()
  name: string;
}
